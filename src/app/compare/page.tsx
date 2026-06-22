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
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">
          Company <span className="text-primary font-black">Compensation Comparer</span>
        </h1>
        <p className="text-muted text-sm mt-1 font-semibold">
          Perform side-by-side base pay, stock, and bonus comparisons.
        </p>
      </div>
      <ComparisonWorkspace
        companies={companies}
        roles={roles}
        locations={locations}
      />
    </div>
  );
}
