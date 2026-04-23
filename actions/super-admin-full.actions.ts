"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Super Admin User Management
export async function superAdmin_getAllUsers(filters: any = {}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          country: true,
          verificationStatus: true,
        },
      },
      _count: {
        select: {
          auditLogs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function superAdmin_updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "USER_ROLE_CHANGED",
      targetType: "User",
      targetId: userId,
      metadata: { newRole: role },
    },
  });

  return updatedUser;
}

export async function superAdmin_updateUserStatus(userId: string, status: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "USER_STATUS_CHANGED",
      targetType: "User",
      targetId: userId,
      metadata: { newStatus: status, reason },
    },
  });

  return updatedUser;
}

export async function superAdmin_deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });

  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "USER_DELETED",
      targetType: "User",
      targetId: userId,
      metadata: { deletedUser: user },
    },
  });

  return { success: true };
}

// Super Admin Company Management
export async function superAdmin_getAllCompanies() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const companies = await prisma.company.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          products: true,
          rfqResponses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return companies;
}

export async function superAdmin_verifyCompany(companyId: string, status: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      verificationStatus: status as any,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "COMPANY_VERIFICATION_CHANGED",
      targetType: "Company",
      targetId: companyId,
      metadata: { newStatus: status, reason },
    },
  });

  return updatedCompany;
}

export async function superAdmin_deleteCompany(companyId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, user: { select: { email: true } } },
  });

  await prisma.company.delete({ where: { id: companyId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "COMPANY_DELETED",
      targetType: "Company",
      targetId: companyId,
      metadata: { deletedCompany: company },
    },
  });

  return { success: true };
}

// Super Admin Product Management
export async function superAdmin_getAllProducts() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const products = await prisma.product.findMany({
    include: {
      company: {
        select: { name: true, user: { select: { name: true } } },
      },
      category: {
        select: { name: true },
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products;
}

export async function superAdmin_updateProductStatus(productId: string, status: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { status: status as any },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PRODUCT_STATUS_CHANGED",
      targetType: "Product",
      targetId: productId,
      metadata: { newStatus: status, reason },
    },
  });

  return updatedProduct;
}

export async function superAdmin_deleteProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, company: { select: { name: true } } },
  });

  await prisma.product.delete({ where: { id: productId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PRODUCT_DELETED",
      targetType: "Product",
      targetId: productId,
      metadata: { deletedProduct: product },
    },
  });

  return { success: true };
}

// Super Admin RFQ Management
export async function superAdmin_getAllRFQs() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const rfqs = await prisma.rFQ.findMany({
    include: {
      buyer: {
        select: { name: true, email: true },
      },
      _count: {
        select: { responses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rfqs;
}

export async function superAdmin_updateRFQStatus(rfqId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedRFQ = await prisma.rFQ.update({
    where: { id: rfqId },
    data: { status: status as any },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "RFQ_STATUS_CHANGED",
      targetType: "RFQ",
      targetId: rfqId,
      metadata: { newStatus: status },
    },
  });

  return updatedRFQ;
}

// Super Admin Settings
export async function superAdmin_updateSetting(key: string, value: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const setting = await prisma.platformSetting.upsert({
    where: { key },
    update: { value, updatedBy: session.user.id },
    create: { key, value, updatedBy: session.user.id },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PLATFORM_SETTING_CHANGED",
      targetType: "PlatformSetting",
      targetId: setting.id,
      metadata: { key, value },
    },
  });

  return setting;
}

// Super Admin Analytics
export async function superAdmin_getAnalytics() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const [
    totalUsers,
    totalCompanies,
    totalProducts,
    totalRFQs,
    userGrowth,
    productStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.product.count(),
    prisma.rFQ.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.product.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  return {
    totalUsers,
    totalCompanies,
    totalProducts,
    totalRFQs,
    userGrowth,
    productStats,
  };
}

// Super Admin Audit Logs
export async function superAdmin_getAuditLogs(limit: number = 100) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs;
}