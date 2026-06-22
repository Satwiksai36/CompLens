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

  return <RolesClient roles={roles} records={records} />;
}
