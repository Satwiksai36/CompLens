import { prisma } from "@/lib/db";
import { DashboardCharts } from "@/components/DashboardCharts";

export const revalidate = 0;

export default async function InsightsPage() {
  const [companies, roles, locations, records] = await Promise.all([
    prisma.company.findMany({ include: { levels: true } }),
    prisma.role.findMany(),
    prisma.location.findMany(),
    prisma.compensationRecord.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
    }),
  ]);

  const getUSDValue = (amount: number, currency: string): number => {
    const toUSD: Record<string, number> = {
      USD: 1.0,
      INR: 0.012,
      GBP: 1.25,
      EUR: 1.08,
    };
    return amount * (toUSD[currency.toUpperCase()] || 1.0);
  };

  // 1. Calculate company pay data
  const companyCompsMap: Record<string, number[]> = {};
  records.forEach((r) => {
    if (!companyCompsMap[r.company.name]) companyCompsMap[r.company.name] = [];
    companyCompsMap[r.company.name].push(getUSDValue(r.totalCompensation, r.currency));
  });

  const companyData = Object.entries(companyCompsMap)
    .map(([name, comps]) => {
      comps.sort((a, b) => a - b);
      const mid = Math.floor(comps.length / 2);
      const median = comps.length % 2 !== 0 ? comps[mid] : (comps[mid - 1] + comps[mid]) / 2;
      return { name, medianPay: median };
    })
    .sort((a, b) => b.medianPay - a.medianPay)
    .slice(0, 6);

  // 2. Calculate trend data (YOE vs total comp)
  const yoeCompsMap: Record<number, number[]> = {};
  records.forEach((r) => {
    const yoe = r.yearsExperience;
    if (!yoeCompsMap[yoe]) yoeCompsMap[yoe] = [];
    yoeCompsMap[yoe].push(getUSDValue(r.totalCompensation, r.currency));
  });

  const trendData = Object.entries(yoeCompsMap)
    .map(([yoeStr, comps]) => {
      const sum = comps.reduce((acc, v) => acc + v, 0);
      return {
        yearsOfExperience: parseInt(yoeStr),
        totalComp: sum / comps.length,
      };
    })
    .sort((a, b) => a.yearsOfExperience - b.yearsOfExperience)
    .slice(0, 12); // Limit plot points for cleaner rendering

  // 3. Calculate role counts
  const roleCountsMap: Record<string, number> = {};
  records.forEach((r) => {
    const name = r.role.roleName;
    roleCountsMap[name] = (roleCountsMap[name] || 0) + 1;
  });
  const roleData = Object.entries(roleCountsMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 4. Calculate location scores (using major cities)
  const locationCompsMap: Record<string, { col: number; comps: number[] }> = {};
  records.forEach((r) => {
    const city = r.location.city;
    if (!locationCompsMap[city]) {
      locationCompsMap[city] = {
        col: r.location.costOfLivingIndex,
        comps: [],
      };
    }
    locationCompsMap[city].comps.push(getUSDValue(r.totalCompensation, r.currency));
  });

  const locationData = Object.entries(locationCompsMap)
    .map(([name, data]) => {
      data.comps.sort((a, b) => a - b);
      const mid = Math.floor(data.comps.length / 2);
      const median = data.comps.length % 2 !== 0 ? data.comps[mid] : (data.comps[mid - 1] + data.comps[mid]) / 2;
      
      // Adjusted score score = (median / col) * 100
      const adjustedScore = (median / data.col) * 100;

      return {
        name,
        adjustedScore,
      };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, 6);

  return (
    <div className="page-home min-h-screen pb-16">
      <div className="main-container py-8 animate-fadeIn">
        <div className="border-b border-border/80 pb-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Compensation <span className="text-gradient-primary">Insights & Analytics</span>
          </h1>
          <p className="text-muted text-sm mt-1.5 font-semibold">
            Visual dashboards comparing wage trends, role concentrations, and geographic buying-power indexing.
          </p>
        </div>
        <DashboardCharts
          companyData={companyData}
          trendData={trendData}
          roleData={roleData}
          locationData={locationData}
        />
      </div>
    </div>
  );
}
