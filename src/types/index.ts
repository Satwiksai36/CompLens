export interface HeuristicResult {
  normalizedLevel: string; // Entry, Mid, Senior, Staff, Principal, Director+
  confidenceScore: number;
  mappingType: 'estimated';
}

export interface CompanyForComparison {
  id: string;
  name: string;
  industry: string;
  logo: string | null;
  levels: {
    id: string;
    levelCode: string;
    equivalentLevel: string;
    mappingType: string;
    confidenceScore: number;
    description: string | null;
  }[];
}

export interface DatapointDetail {
  id: string;
  levelCode: string;
  equivalentLevel: string;
  mappingType: string;
  confidenceScore: number;
  yearsExperience: number;
  totalCompensation: number;
  baseSalary: number;
  bonus: number;
  stockGrant: number;
  joiningBonus: number;
  locationCity: string;
  locationCountry: string;
  currency: string;
  submittedAt: string;
}

export interface CompanyCompSummary {
  companyId: string;
  companyName: string;
  logo: string | null;
  count: number;
  average: number | null;
  median: number | null;
  min: number;
  max: number;
  currency: string;
  datapoints: DatapointDetail[];
}

export interface BenchmarkResult {
  percentile: number;
  sampleSize: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  isFallbackUsed: boolean;
}

export interface LocationIntelligenceItem {
  id: string;
  city: string;
  country: string;
  region: string | null;
  costOfLivingIndex: number;
  medianCompensation: number;
  adjustedCompensationScore: number; // median / costOfLivingIndex * 100
  locationPremium: number; // percentage premium relative to regional average
}
