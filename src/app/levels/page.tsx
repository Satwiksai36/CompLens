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
    <div className="page-home min-h-screen pb-16">
      <div className="main-container py-8 animate-fadeIn">
        <div className="border-b border-border/80 pb-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Levels <span className="text-gradient-primary">Comparison Matrix</span>
          </h1>
          <p className="text-muted text-sm mt-1.5 font-semibold">
            Explore equivalent grades and internal titles side-by-side.
          </p>
        </div>
        <LevelMatrix companies={companies} />
      </div>
    </div>
  );
}
