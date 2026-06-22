import { prisma } from "@/lib/db";
import CompaniesClient from "./CompaniesClient";

export const revalidate = 0;

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      compensationRecords: {
        where: { verificationStatus: "VERIFIED" },
        include: { location: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate stats for each company
  const processedCompanies = companies.map((c) => {
    const records = c.compensationRecords;
    const compsUSD = records.map((r) => {
      // Normalize to USD
      const rates: Record<string, number> = {
        USD: 1.0,
        INR: 0.012,
        GBP: 1.25,
        EUR: 1.08,
      };
      return r.totalCompensation * (rates[r.currency.toUpperCase()] || 1.0);
    }).sort((a, b) => a - b);

    let medianComp = 0;
    if (compsUSD.length > 0) {
      const mid = Math.floor(compsUSD.length / 2);
      medianComp = compsUSD.length % 2 !== 0 ? compsUSD[mid] : (compsUSD[mid - 1] + compsUSD[mid]) / 2;
    }

    return {
      id: c.id,
      name: c.name,
      logo: c.logo,
      industry: c.industry,
      medianCompensation: medianComp,
      recordCount: records.length,
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">
          Explore <span className="text-primary font-black">Companies</span>
        </h1>
        <p className="text-muted text-sm mt-1 font-semibold">
          Compare tech employers by verified compensation averages and role distributions.
        </p>
      </div>
      <CompaniesClient companies={processedCompanies} />
    </div>
  );
}
