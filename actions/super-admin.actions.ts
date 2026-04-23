"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function superAdmin_getAllUsers(filters: any = {}, pagination: any = {}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
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

  const where: any = {};

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
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function superAdmin_updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: { id: true, role: true },
  });

  // Log the action
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

export async function superAdmin_updateUserStatus(
  userId: string,
  status: string,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
    select: { id: true, status: true },
  });

  // Log the action
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

  // Get user details before deletion for audit log
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Delete the user
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
      metadata: { deletedUser: user },
    },
  });

  return { success: true };
}

export async function superAdmin_resetUserPassword(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-12);
  const hashedPassword = await import("bcryptjs").then(bcrypt => bcrypt.hash(tempPassword, 12));

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
    },
  });

  // TODO: Send email with temporary password
  // For now, return the temp password (in production, this should be emailed)
  return { tempPassword };
}

export async function superAdmin_getUserDetail(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
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
          },
          documents: true,
        },
      },
      rfqs: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      },
      conversations: {
        include: {
          _count: {
            select: { messages: true },
          },
        },
      },
      auditLogs: {
        where: { targetId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}