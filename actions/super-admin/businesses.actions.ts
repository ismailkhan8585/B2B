"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyVerificationStatus, SubscriptionPlan } from "@prisma/client";
import type {
  CompanyFilters,
  CompaniesResponse,
  CompanyActionResult,
  ChangeVerificationData,
  ChangeSubscriptionData,
  EditCompanyData,
} from "@/types/super-admin/businesses.types";
import { revalidatePath } from "next/cache";

export async function getAllCompanies(filters: CompanyFilters = {}): Promise<CompaniesResponse> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const {
    q,
    verificationStatus,
    subscriptionPlan,
    country,
    isActive,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 25,
  } = filters;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (verificationStatus && verificationStatus !== "ALL") {
    where.verificationStatus = verificationStatus;
  }

  if (subscriptionPlan && subscriptionPlan !== "ALL") {
    where.subscriptionPlan = subscriptionPlan;
  }

  if (country) {
    where.country = { contains: country, mode: "insensitive" };
  }

  if (isActive !== undefined && isActive !== "ALL") {
    where.isActive = isActive;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            fileUrl: true,
            status: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
        rfqResponses: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            products: true,
            rfqResponses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}

export async function getCompanyDetail(companyId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      documents: {
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
          status: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
      },
      rfqResponses: {
        select: {
          id: true,
          rfq: {
            select: {
              title: true,
              createdAt: true,
            },
          },
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          products: true,
          rfqResponses: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
}

export async function changeCompanyVerification(data: ChangeVerificationData): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    const { companyId, status, reason } = data;

    // Get current company info for audit log
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { verificationStatus: true, name: true, user: { select: { email: true } } },
    });

    if (!currentCompany) {
      throw new Error("Company not found");
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: status,
    };

    if (status === "VERIFIED") {
      updateData.verifiedAt = new Date();
    } else if (status === "REJECTED") {
      updateData.verifiedAt = null;
    }

    // Update the verification status
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: { id: true, verificationStatus: true, name: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "COMPANY_VERIFICATION_CHANGED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          oldStatus: currentCompany.verificationStatus,
          newStatus: status,
          reason: reason || null,
          companyName: currentCompany.name,
          ownerEmail: currentCompany.user.email,
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true, data: updatedCompany };
  } catch (error) {
    console.error("Error changing company verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change company verification",
    };
  }
}

export async function changeCompanySubscription(data: ChangeSubscriptionData): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    const { companyId, plan } = data;

    // Get current company info for audit log
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionPlan: true, name: true, user: { select: { email: true } } },
    });

    if (!currentCompany) {
      throw new Error("Company not found");
    }

    // Update the subscription plan
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionPlan: plan },
      select: { id: true, subscriptionPlan: true, name: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "COMPANY_SUBSCRIPTION_CHANGED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          oldPlan: currentCompany.subscriptionPlan,
          newPlan: plan,
          companyName: currentCompany.name,
          ownerEmail: currentCompany.user.email,
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true, data: updatedCompany };
  } catch (error) {
    console.error("Error changing company subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change company subscription",
    };
  }
}

export async function editCompany(data: EditCompanyData): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    const { companyId, ...updateData } = data;

    // Get current company info for audit log
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, user: { select: { email: true } } },
    });

    if (!currentCompany) {
      throw new Error("Company not found");
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: { id: true, name: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "COMPANY_EDITED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          changes: updateData,
          companyName: currentCompany.name,
          ownerEmail: currentCompany.user.email,
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true, data: updatedCompany };
  } catch (error) {
    console.error("Error editing company:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit company",
    };
  }
}

export async function toggleCompanyActive(companyId: string): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    // Get current company info
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { isActive: true, name: true, user: { select: { email: true } } },
    });

    if (!currentCompany) {
      throw new Error("Company not found");
    }

    // Toggle the active status
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: !currentCompany.isActive },
      select: { id: true, isActive: true, name: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "COMPANY_ACTIVE_STATUS_CHANGED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          oldStatus: currentCompany.isActive,
          newStatus: updatedCompany.isActive,
          companyName: currentCompany.name,
          ownerEmail: currentCompany.user.email,
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true, data: updatedCompany };
  } catch (error) {
    console.error("Error toggling company active status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle company status",
    };
  }
}

export async function toggleCompanyFeatured(companyId: string): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    // Get current company info
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, user: { select: { email: true } } },
    });

    if (!currentCompany) {
      throw new Error("Company not found");
    }

    // For now, we'll store featured status in PlatformSetting with a key like `featured_company_${companyId}`
    // In a real app, you might want to add a field to the Company model
    const settingKey = `featured_company_${companyId}`;
    const existingSetting = await prisma.platformSetting.findUnique({
      where: { key: settingKey },
    });

    if (existingSetting) {
      // Remove from featured
      await prisma.platformSetting.delete({
        where: { key: settingKey },
      });
    } else {
      // Add to featured
      await prisma.platformSetting.create({
        data: {
          key: settingKey,
          value: "true",
          updatedBy: session.user.id,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: existingSetting ? "COMPANY_UNFEATURED" : "COMPANY_FEATURED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          companyName: currentCompany.name,
          ownerEmail: currentCompany.user.email,
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true, data: { isFeatured: !existingSetting } };
  } catch (error) {
    console.error("Error toggling company featured status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle company featured status",
    };
  }
}

export async function deleteCompany(companyId: string): Promise<CompanyActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    // Get company details before deletion for audit log
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        user: { select: { email: true } },
        _count: { select: { products: true, rfqResponses: true } },
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Delete the company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: companyId },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "COMPANY_DELETED",
        targetType: "Company",
        targetId: companyId,
        metadata: {
          deletedCompany: {
            name: company.name,
            ownerEmail: company.user.email,
            productsCount: company._count.products,
            rfqResponsesCount: company._count.rfqResponses,
          },
        },
      },
    });

    revalidatePath("/super-admin/businesses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting company:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete company",
    };
  }
}