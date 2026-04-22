"use server";

import { z } from "zod";
import { cache } from "react";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function getOrCreateConversationWithCompany(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const parsedCompanyId = z.string().cuid().parse(companyId);
    const company = await prisma.company.findUnique({
      where: { id: parsedCompanyId },
      select: { id: true, userId: true, name: true },
    });
    if (!company) return { success: false as const, error: "Company not found." };

    const me = session.user.id;
    const other = company.userId;

    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { some: { userId: me } },
        AND: { participants: { some: { userId: other } } },
      },
      select: { id: true },
    });
    if (existing) return { success: true as const, data: existing };

    const created = await prisma.conversation.create({
      data: {
        title: company.name,
        participants: { create: [{ userId: me }, { userId: other }] },
      },
      select: { id: true },
    });

    revalidatePath("/buyer/dashboard/messages");
    revalidatePath("/seller/dashboard/messages");
    return { success: true as const, data: created };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return { success: false as const, error: message };
  }
}

export const getMyConversations = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  const me = session.user.id;
  const conversations = await prisma.conversationParticipant.findMany({
    where: { userId: me },
    orderBy: { conversation: { updatedAt: "desc" } },
    select: {
      conversation: {
        select: {
          id: true,
          title: true,
          updatedAt: true,
          participants: { select: { user: { select: { id: true, name: true, email: true, company: { select: { name: true, slug: true } } } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, type: true, createdAt: true, senderId: true } },
        },
      },
      lastReadAt: true,
    },
  });

  return conversations.map((c) => c.conversation);
});

export async function getConversationMessages(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const id = z.string().cuid().parse(conversationId);
  const me = session.user.id;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: me } },
    select: { id: true },
  });
  if (!participant) return { success: false as const, error: "Forbidden" };

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, content: true, type: true, fileUrl: true, fileName: true, createdAt: true },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId: me } },
    data: { lastReadAt: new Date() },
    select: { id: true },
  });

  return { success: true as const, data: { messages } };
}

const SendMessageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1).max(4000).optional(),
});

export async function sendMessage(input: unknown, file?: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const data = SendMessageSchema.parse(input);
    const me = session.user.id;

    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: data.conversationId, userId: me } },
      select: { id: true },
    });
    if (!participant) return { success: false as const, error: "Forbidden" };

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let type: "TEXT" | "FILE" = "TEXT";

    if (file) {
      if (file.size > 20 * 1024 * 1024) return { success: false as const, error: "File too large (max 20MB)." };
      const uploaded = await uploadToCloudinary(file, "b2b/messages");
      fileUrl = uploaded.url;
      fileName = file.name;
      type = "FILE";
    }

    const created = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: me,
        content: data.content,
        type,
        fileUrl,
        fileName,
      },
      select: { id: true },
    });

    revalidatePath("/buyer/dashboard/messages");
    revalidatePath("/seller/dashboard/messages");
    return { success: true as const, data: created };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return { success: false as const, error: message };
  }
}

