import { prisma } from "@/lib/db";
import { LevelMatrix } from "@/components/LevelMatrix";

export const revalidate = 0;

export default async function LevelsPage() {
  const companies = await prisma.company.findMany({
    include: {
      levels: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Levels Comparison Matrix</h1>
        <p className="text-muted text-sm mt-1">
          Explore equivalent grades and internal titles side-by-side.
        </p>
      </div>
      <LevelMatrix companies={companies} />
    </div>
  );
}
