"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).optional(),
});

export async function updateMyProfile(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const data = UpdateProfileSchema.parse(input);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, phone: data.phone },
      select: { id: true },
    });

    revalidatePath("/buyer/dashboard/settings");
    revalidatePath("/seller/dashboard/settings");
    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { success: false as const, error: message };
  }
}

export async function uploadMyAvatar(file: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (!file) return { success: false as const, error: "Missing file." };
    if (file.size > 5 * 1024 * 1024) return { success: false as const, error: "Avatar too large (max 5MB)." };

    const { url } = await uploadToCloudinary(file, "b2b/avatars");
    await prisma.user.update({ where: { id: session.user.id }, data: { avatar: url }, select: { id: true } });

    revalidatePath("/buyer/dashboard/settings");
    revalidatePath("/seller/dashboard/settings");
    return { success: true as const, data: { url } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { success: false as const, error: message };
  }
}

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changeMyPassword(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const data = ChangePasswordSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });
    if (!user?.passwordHash) return { success: false as const, error: "Password login not enabled for this account." };

    const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!ok) return { success: false as const, error: "Current password is incorrect." };

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash }, select: { id: true } });

    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Change password failed";
    return { success: false as const, error: message };
  }
}

