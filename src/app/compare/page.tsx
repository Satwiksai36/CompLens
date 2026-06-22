import { prisma } from "@/lib/db";
import { ComparisonWorkspace } from "@/components/ComparisonWorkspace";

export const revalidate = 0;

export default async function ComparePage() {
  const [companies, roles, locations] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { roleName: "asc" } }),
    prisma.location.findMany({ orderBy: { city: "asc" } }),
  ]);

  return (
    <div className="page-home min-h-screen pb-16">
      <div className="main-container py-8 animate-fadeIn">
        <div className="border-b border-border/80 pb-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Company <span className="text-gradient-primary">Compensation Comparer</span>
          </h1>
          <p className="text-muted text-sm mt-1.5 font-semibold">
            Perform side-by-side base pay, stock, and bonus comparisons.
          </p>
        </div>
        <ComparisonWorkspace
          companies={companies}
          roles={roles}
          locations={locations}
        />
      </div>
    </div>
  );
}
