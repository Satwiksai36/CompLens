import { prisma } from "@/lib/db";
import RolesClient from "./RolesClient";

export const revalidate = 0;

export default async function RolesPage() {
  const [roles, records] = await Promise.all([
    prisma.role.findMany({ orderBy: { roleName: "asc" } }),
    prisma.compensationRecord.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <div className="page-home min-h-screen pb-16">
      <div className="main-container py-8 animate-fadeIn">
        <div className="border-b border-border/80 pb-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Explore <span className="text-gradient-primary">Roles & Categories</span>
          </h1>
          <p className="text-muted text-sm mt-1.5 font-semibold">
            Track and segment verified developer salaries by core discipline.
          </p>
        </div>
        <RolesClient roles={roles} records={records} />
      </div>
    </div>
  );
}
