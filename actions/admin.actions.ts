"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return session.user.id;
}

const PaginationSchema = z.object({
  q: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});

export async function getAllUsers(filters: unknown) {
  try {
    const session = await auth();
    requireAdmin(session);

    const f = PaginationSchema.parse(filters);
    const where: any = {};
    if (f.q) {
      where.OR = [
        { email: { contains: f.q, mode: "insensitive" } },
        { name: { contains: f.q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (f.page - 1) * f.pageSize,
        take: f.pageSize,
        select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true as const, data: { items, total, page: f.page, pageSize: f.pageSize } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED") {
  try {
    const session = await auth();
    const actorId = requireAdmin(session);

    const parsedUserId = z.string().cuid().parse(userId);
    const parsedStatus = z.enum(["ACTIVE", "SUSPENDED", "BANNED"]).parse(status);

    const user = await prisma.user.update({
      where: { id: parsedUserId },
      data: { status: parsedStatus },
      select: { id: true, status: true },
    });

    await prisma.auditLog.create({
      data: { actorId, action: "USER_STATUS_UPDATED", targetType: "User", targetId: user.id, metadata: { status: user.status } },
      select: { id: true },
    });

    revalidatePath("/admin/dashboard");
    return { success: true as const, data: user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();
    const actorId = requireAdmin(session);

    const parsedUserId = z.string().cuid().parse(userId);

    const deleted = await prisma.user.delete({ where: { id: parsedUserId }, select: { id: true, email: true } });

    await prisma.auditLog.create({
      data: { actorId, action: "USER_DELETED", targetType: "User", targetId: deleted.id, metadata: { email: deleted.email } },
      select: { id: true },
    });

    revalidatePath("/admin/dashboard");
    return { success: true as const, data: { id: deleted.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function verifyCompany(companyId: string, status: "VERIFIED" | "REJECTED" | "PENDING" | "UNVERIFIED") {
  try {
    const session = await auth();
    const actorId = requireAdmin(session);

    const parsedCompanyId = z.string().cuid().parse(companyId);
    const parsedStatus = z.enum(["VERIFIED", "REJECTED", "PENDING", "UNVERIFIED"]).parse(status);

    const updated = await prisma.company.update({
      where: { id: parsedCompanyId },
      data: { verificationStatus: parsedStatus, verifiedAt: parsedStatus === "VERIFIED" ? new Date() : null },
      select: { id: true, verificationStatus: true, slug: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: "COMPANY_VERIFICATION_UPDATED",
        targetType: "Company",
        targetId: updated.id,
        metadata: { status: updated.verificationStatus },
      },
      select: { id: true },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath(`/suppliers/${updated.slug}`);
    return { success: true as const, data: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function getAllCompanies(filters: unknown) {
  try {
    const session = await auth();
    requireAdmin(session);

    const f = PaginationSchema.parse(filters);
    const where: any = {};
    if (f.q) {
      where.OR = [{ name: { contains: f.q, mode: "insensitive" } }, { slug: { contains: f.q, mode: "insensitive" } }];
    }

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (f.page - 1) * f.pageSize,
        take: f.pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          verificationStatus: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return { success: true as const, data: { items, total, page: f.page, pageSize: f.pageSize } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function deleteCompany(companyId: string) {
  try {
    const session = await auth();
    const actorId = requireAdmin(session);

    const parsedCompanyId = z.string().cuid().parse(companyId);
    const company = await prisma.company.delete({ where: { id: parsedCompanyId }, select: { id: true, slug: true, name: true } });

    await prisma.auditLog.create({
      data: { actorId, action: "COMPANY_DELETED", targetType: "Company", targetId: company.id, metadata: { slug: company.slug } },
      select: { id: true },
    });

    revalidatePath("/admin/dashboard");
    return { success: true as const, data: { id: company.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export async function getDashboardStats() {
  try {
    const session = await auth();
    requireAdmin(session);

    const [users, companies, products, rfqs, pendingVerifications] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.product.count(),
      prisma.rFQ.count(),
      prisma.company.count({ where: { verificationStatus: "PENDING" } }),
    ]);

    return { success: true as const, data: { users, companies, products, rfqs, pendingVerifications } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

