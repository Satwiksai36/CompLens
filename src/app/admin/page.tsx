import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  const [pendingRecords, companies, roles, locations, levels] = await Promise.all([
    prisma.compensationRecord.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        company: true,
        role: true,
        level: true,
        location: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { roleName: "asc" } }),
    prisma.location.findMany({ orderBy: { city: "asc" } }),
    prisma.level.findMany({
      include: { company: true },
      orderBy: { levelCode: "asc" },
    }),
  ]);

  return (
    <AdminClient
      pendingRecords={pendingRecords}
      companies={companies}
      roles={roles}
      locations={locations}
      levels={levels}
    />
  );
}
