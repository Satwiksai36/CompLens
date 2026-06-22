import { prisma } from "../lib/db";
import { CompanyCompSummary, BenchmarkResult, DatapointDetail } from "../types";

export class ComparisonService {
  // Currency Conversion Rates (Normalizing to USD)
  private static getUSDConversionRate(currency: string): number {
    const rates: Record<string, number> = {
      USD: 1.0,
      INR: 0.012, // 1 INR = 0.012 USD (approx 83.3 INR = 1 USD)
      GBP: 1.25,  // 1 GBP = 1.25 USD
      EUR: 1.08,  // 1 EUR = 1.08 USD
    };
    return rates[currency.toUpperCase()] || 1.0;
  }

  /**
   * Directly compares companies side by side based on normalized level grade and role category.
   */
  async compareByLevelAndRole(params: {
    equivalentLevel: string; // Entry, Mid, Senior, Staff, Principal, Director+
    roleId: string;
    locationId?: string;
    adjustForCol?: boolean;
  }): Promise<CompanyCompSummary[]> {
    // 1. Fetch matching verified compensation records
    const records = await prisma.compensationRecord.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        roleId: params.roleId,
        level: {
          equivalentLevel: params.equivalentLevel,
        },
        ...(params.locationId ? { locationId: params.locationId } : {}),
      },
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
    });

    const baselineCOL = 100.0; // San Francisco is baseline

    // 2. Process records: convert currencies and apply COL adjustments
    const processedPoints = records.map((rec) => {
      const rate = ComparisonService.getUSDConversionRate(rec.currency);
      const rawTotalUSD = rec.totalCompensation * rate;
      const rawBaseUSD = rec.baseSalary * rate;
      const rawBonusUSD = rec.bonus * rate;
      const rawEquityUSD = rec.stockGrant * rate;
      const rawJoiningUSD = rec.joiningBonus * rate;

      let finalTotalComp = rawTotalUSD;

      // Adjust for Cost of Living if requested
      if (params.adjustForCol) {
        const colIndex = rec.location.costOfLivingIndex;
        // adjusted = raw * (baseline / local)
        finalTotalComp = rawTotalUSD * (baselineCOL / colIndex);
      }

      const detail: DatapointDetail = {
        id: rec.id,
        levelCode: rec.level.levelCode,
        equivalentLevel: rec.level.equivalentLevel,
        mappingType: rec.level.mappingType,
        confidenceScore: rec.level.confidenceScore,
        yearsExperience: rec.yearsExperience,
        totalCompensation: finalTotalComp,
        baseSalary: rawBaseUSD,
        bonus: rawBonusUSD,
        stockGrant: rawEquityUSD,
        joiningBonus: rawJoiningUSD,
        locationCity: rec.location.city,
        locationCountry: rec.location.country,
        currency: 'USD',
        submittedAt: rec.submittedAt.toISOString(),
      };

      return {
        companyId: rec.companyId,
        companyName: rec.company.name,
        companyLogo: rec.company.logo,
        detail,
      };
    });

    // 3. Group by company and compute statistics
    const companyGroups: Record<string, { name: string; logo: string | null; points: DatapointDetail[] }> = {};
    for (const p of processedPoints) {
      if (!companyGroups[p.companyId]) {
        companyGroups[p.companyId] = {
          name: p.companyName,
          logo: p.companyLogo,
          points: [],
        };
      }
      companyGroups[p.companyId].points.push(p.detail);
    }

    const summaries: CompanyCompSummary[] = [];

    for (const [companyId, group] of Object.entries(companyGroups)) {
      const totalComps = group.points.map((p) => p.totalCompensation).sort((a, b) => a - b);
      const count = totalComps.length;
      const sum = totalComps.reduce((acc, val) => acc + val, 0);

      // Average and median calculations (suppressed if count < 3)
      const average = count >= 3 ? sum / count : null;
      let median: number | null = null;
      if (count >= 3) {
        const mid = Math.floor(count / 2);
        median = count % 2 !== 0 ? totalComps[mid] : (totalComps[mid - 1] + totalComps[mid]) / 2;
      }

      summaries.push({
        companyId,
        companyName: group.name,
        logo: group.logo,
        count,
        average,
        median,
        min: totalComps[0] || 0,
        max: totalComps[count - 1] || 0,
        currency: 'USD',
        datapoints: group.points,
      });
    }

    // Sort by median descending (put N/A medians at the bottom)
    return summaries.sort((a, b) => {
      if (a.median === null && b.median === null) return 0;
      if (a.median === null) return 1;
      if (b.median === null) return -1;
      return b.median - a.median;
    });
  }

  /**
   * Benchmarks a given compensation against a cohort
   */
  async calculatePercentile(params: {
    equivalentLevel: string;
    roleId: string;
    locationId: string;
    totalCompensation: number;
    currency: string;
  }): Promise<BenchmarkResult> {
    const targetLocation = await prisma.location.findUnique({
      where: { id: params.locationId },
    });
    if (!targetLocation) {
      throw new Error("Target location not found");
    }

    const userRate = ComparisonService.getUSDConversionRate(params.currency);
    const userTotalUSD = params.totalCompensation * userRate;

    // 1. Get local cohort verified submissions
    const localRecords = await prisma.compensationRecord.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        roleId: params.roleId,
        level: {
          equivalentLevel: params.equivalentLevel,
        },
        locationId: params.locationId,
      },
      include: {
        location: true,
      },
    });

    let useFallback = false;
    let cohortUSDComps: number[] = [];

    // Fallback logic: if local database has < 3 records, load all locations and scale them using COL ratio
    if (localRecords.length < 3) {
      useFallback = true;
      const globalRecords = await prisma.compensationRecord.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          roleId: params.roleId,
          level: {
            equivalentLevel: params.equivalentLevel,
          },
        },
        include: {
          location: true,
        },
      });

      const targetCol = targetLocation.costOfLivingIndex;

      cohortUSDComps = globalRecords.map((rec) => {
        const rate = ComparisonService.getUSDConversionRate(rec.currency);
        const recTotalUSD = rec.totalCompensation * rate;
        const recCol = rec.location.costOfLivingIndex;

        // adjusted = globalUSD * (localCOL / globalCOL)
        return recTotalUSD * (targetCol / recCol);
      }).sort((a, b) => a - b);
    } else {
      cohortUSDComps = localRecords.map((rec) => {
        const rate = ComparisonService.getUSDConversionRate(rec.currency);
        return rec.totalCompensation * rate;
      }).sort((a, b) => a - b);
    }

    const count = cohortUSDComps.length;

    if (count === 0) {
      return {
        percentile: 50,
        sampleSize: 0,
        percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
        isFallbackUsed: useFallback,
      };
    }

    // 2. Find rank of user's compensation in cohort
    let rank = 0;
    let equalCount = 0;
    for (const val of cohortUSDComps) {
      if (val < userTotalUSD) {
        rank++;
      } else if (val === userTotalUSD) {
        equalCount++;
      }
    }
    const percentile = ((rank + 0.5 * equalCount) / count) * 100;

    // Percentile interpolation helper
    const getPercentileValue = (sortedArray: number[], p: number): number => {
      if (sortedArray.length === 0) return 0;
      const index = (p / 100) * (sortedArray.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    };

    return {
      percentile: Math.round(percentile),
      sampleSize: count,
      percentiles: {
        p10: Math.round(getPercentileValue(cohortUSDComps, 10)),
        p25: Math.round(getPercentileValue(cohortUSDComps, 25)),
        p50: Math.round(getPercentileValue(cohortUSDComps, 50)),
        p75: Math.round(getPercentileValue(cohortUSDComps, 75)),
        p90: Math.round(getPercentileValue(cohortUSDComps, 90)),
      },
      isFallbackUsed: useFallback,
    };
  }
}
