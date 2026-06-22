"use server";

import { prisma } from "../lib/db";
import { EquivalencyService } from "../services/equivalency.service";
import { ComparisonService } from "../services/comparison.service";
import { revalidatePath } from "next/cache";

const compService = new ComparisonService();

// 1. Metadata Actions
export async function getCompanies() {
  return prisma.company.findMany({
    include: {
      levels: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { roleName: "asc" },
  });
}

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { city: "asc" },
  });
}

export async function getLevels(companyId?: string) {
  return prisma.level.findMany({
    where: companyId ? { companyId } : {},
    include: { company: true },
    orderBy: { levelCode: "asc" },
  });
}

export async function getRecentSubmissions(limit = 10) {
  return prisma.compensationRecord.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
    orderBy: { submittedAt: "desc" },
    take: limit,
  });
}

// 2. Analytics Actions
export async function getComparison(params: {
  equivalentLevel: string;
  roleId: string;
  locationId?: string;
  adjustForCol?: boolean;
}) {
  return compService.compareByLevelAndRole(params);
}

export async function getBenchmark(params: {
  equivalentLevel: string;
  roleId: string;
  locationId: string;
  totalCompensation: number;
  currency: string;
}) {
  return compService.calculatePercentile(params);
}

// 3. Compensation Submission Action
export async function submitCompensation(data: {
  companyId: string;
  roleId: string;
  locationId: string;
  yearsExperience: number;
  baseSalary: number;
  stockGrant: number;
  bonus: number;
  joiningBonus: number;
  currency: string;
  levelId?: string;       // For disclosed frameworks path
  designation?: string;   // For estimated path (heurstics inference)
}) {
  try {
    let finalLevelId = data.levelId;

    if (!finalLevelId && data.designation) {
      // Estimated framework path: run heuristic level inference engine
      const inference = EquivalencyService.inferLevel({
        designation: data.designation,
        yearsOfExperience: data.yearsExperience,
      });

      // Find or create level mapping entry for this designation
      let level = await prisma.level.findFirst({
        where: {
          companyId: data.companyId,
          levelCode: data.designation,
        },
      });

      if (!level) {
        level = await prisma.level.create({
          data: {
            companyId: data.companyId,
            levelCode: data.designation,
            equivalentLevel: inference.normalizedLevel,
            mappingType: "estimated",
            confidenceScore: inference.confidenceScore,
            description: `Heuristic estimation for designation: ${data.designation}`,
          },
        });
      }

      finalLevelId = level.id;
    }

    if (!finalLevelId) {
      throw new Error("Either a level mapping or a job designation must be provided.");
    }

    const total = data.baseSalary + (data.stockGrant / 4) + data.bonus;

    const record = await prisma.compensationRecord.create({
      data: {
        companyId: data.companyId,
        roleId: data.roleId,
        levelId: finalLevelId,
        locationId: data.locationId,
        yearsExperience: data.yearsExperience,
        baseSalary: data.baseSalary,
        stockGrant: data.stockGrant,
        bonus: data.bonus,
        joiningBonus: data.joiningBonus,
        totalCompensation: total,
        currency: data.currency,
        verificationStatus: "PENDING", // PENDING moderation by default
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, recordId: record.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit compensation." };
  }
}

// 4. Admin Queue & Moderation Actions
export async function getPendingSubmissions() {
  return prisma.compensationRecord.findMany({
    where: { verificationStatus: "PENDING" },
    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function moderateSubmission(id: string, status: "VERIFIED" | "REJECTED") {
  try {
    await prisma.compensationRecord.update({
      where: { id },
      data: { verificationStatus: status },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update status." };
  }
}

// 5. Admin CRUD Actions
export async function deleteRecord(id: string) {
  try {
    await prisma.compensationRecord.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCompany(data: { name: string; industry: string; logo?: string }) {
  try {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        industry: data.industry,
        logo: data.logo || "logo-default",
      },
    });
    revalidatePath("/");
    return { success: true, company };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCompany(id: string) {
  try {
    await prisma.company.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createRole(data: { roleName: string; category: string }) {
  try {
    const role = await prisma.role.create({
      data: {
        roleName: data.roleName,
        category: data.category,
      },
    });
    revalidatePath("/");
    return { success: true, role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRole(id: string) {
  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLevel(data: {
  companyId: string;
  levelCode: string;
  equivalentLevel: string;
  description?: string;
}) {
  try {
    const level = await prisma.level.create({
      data: {
        companyId: data.companyId,
        levelCode: data.levelCode,
        equivalentLevel: data.equivalentLevel,
        description: data.description || "",
        mappingType: "disclosed",
        confidenceScore: 1.0,
      },
    });
    revalidatePath("/");
    return { success: true, level };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLevel(id: string) {
  try {
    await prisma.level.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLocation(data: {
  city: string;
  country: string;
  region?: string;
  costOfLivingIndex: number;
}) {
  try {
    const location = await prisma.location.create({
      data: {
        city: data.city,
        country: data.country,
        region: data.region || "APAC",
        costOfLivingIndex: data.costOfLivingIndex,
      },
    });
    revalidatePath("/");
    return { success: true, location };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLocation(id: string) {
  try {
    await prisma.location.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
