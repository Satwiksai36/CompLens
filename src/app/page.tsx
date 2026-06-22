import { prisma } from "@/lib/db";
import { getCurrentUserAction } from "@/actions/auth.actions";
import DashboardClient from "./DashboardClient";

export const revalidate = 0; // Dynamic server rendering to pull live database updates

export default async function Page() {
  // Query all initial metadata from database on the server
  const [companies, roles, locations, records, levels, currentUser] = await Promise.all([
    prisma.company.findMany({
      include: { levels: true },
      orderBy: { name: "asc" },
    }),
    prisma.role.findMany({
      orderBy: { roleName: "asc" },
    }),
    prisma.location.findMany({
      orderBy: { city: "asc" },
    }),
    prisma.compensationRecord.findMany({
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.level.findMany({
      include: { company: true },
      orderBy: { levelCode: "asc" },
    }),
    getCurrentUserAction(),
  ]);

  return (
    <DashboardClient
      initialCompanies={companies}
      initialRoles={roles}
      initialLocations={locations}
      initialRecords={records}
      initialLevels={levels}
      currentUser={currentUser}
    />
  );
}

