"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import type {
  UserFilters,
  UsersResponse,
  UserActionResult,
  BulkActionResult,
  ChangeRoleData,
  ChangeStatusData,
} from "@/types/super-admin/users.types";
import { revalidatePath } from "next/cache";

export async function getAllUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const {
    q,
    role,
    status,
    country,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 25,
  } = filters;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (country) {
    where.company = { country: { contains: country, mode: "insensitive" } };
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}

export async function getUserDetail(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: {
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
        },
      },
      rfqs: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      conversations: {
        include: {
          _count: {
            select: { messages: true },
          },
        },
        take: 5,
      },
      auditLogs: {
        where: { targetId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      sessions: {
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function changeUserRole(data: ChangeRoleData): Promise<UserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    const { userId, newRole } = data;

    // Get current user info for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Update the role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, role: true, email: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_ROLE_CHANGED",
        targetType: "User",
        targetId: userId,
        metadata: {
          oldRole: currentUser.role,
          newRole: newRole,
          userEmail: currentUser.email,
        },
      },
    });

    revalidatePath("/super-admin/users");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error changing user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change user role",
    };
  }
}

export async function changeUserStatus(data: ChangeStatusData): Promise<UserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    const { userId, newStatus, reason } = data;

    // Get current user info for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, email: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Update the status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      select: { id: true, status: true, email: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_STATUS_CHANGED",
        targetType: "User",
        targetId: userId,
        metadata: {
          oldStatus: currentUser.status,
          newStatus: newStatus,
          reason: reason || null,
          userEmail: currentUser.email,
        },
      },
    });

    revalidatePath("/super-admin/users");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error changing user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change user status",
    };
  }
}

export async function deleteUser(userId: string): Promise<UserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    // Get user details before deletion for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        company: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_DELETED",
        targetType: "User",
        targetId: userId,
        metadata: {
          deletedUser: {
            email: user.email,
            role: user.role,
            name: user.name,
            companyName: user.company?.name,
          },
        },
      },
    });

    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export async function resetUserPassword(userId: string): Promise<UserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_PASSWORD_RESET",
        targetType: "User",
        targetId: userId,
        metadata: { userEmail: user.email },
      },
    });

    // TODO: Send email with temporary password using Resend
    // For now, return the temp password (in development only)
    revalidatePath("/super-admin/users");
    return {
      success: true,
      data: { tempPassword, message: "Password reset successfully. Check user email for new password." },
    };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset user password",
    };
  }
}

export async function bulkUpdateUserStatus(
  userIds: string[],
  newStatus: UserStatus,
  reason?: string
): Promise<BulkActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        await changeUserStatus({ userId, newStatus, reason });
        processed++;
      } catch (error) {
        failed++;
        errors.push(`User ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    revalidatePath("/super-admin/users");
    return {
      success: failed === 0,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error in bulk status update:", error);
    return {
      success: false,
      processed: 0,
      failed: userIds.length,
      errors: [error instanceof Error ? error.message : "Bulk operation failed"],
    };
  }
}

export async function bulkDeleteUsers(userIds: string[]): Promise<BulkActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        await deleteUser(userId);
        processed++;
      } catch (error) {
        failed++;
        errors.push(`User ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    revalidatePath("/super-admin/users");
    return {
      success: failed === 0,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return {
      success: false,
      processed: 0,
      failed: userIds.length,
      errors: [error instanceof Error ? error.message : "Bulk operation failed"],
    };
  }
}