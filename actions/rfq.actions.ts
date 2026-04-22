"use server";

import { z } from "zod";
import { cache } from "react";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateRFQSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(5000),
  categoryId: z.string().cuid().optional().nullable(),
  quantity: z.number().int().min(1),
  unit: z.string().max(40).optional(),
  budget: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(6).default("USD"),
  deadline: z.string().optional(),
  deliveryCountry: z.string().max(80).optional(),
  isPublic: z.boolean().default(true),
  attachmentUrl: z.string().url().optional(),
});

export async function createRFQ(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "BUYER") return { success: false as const, error: "Only buyers can post RFQs." };

    const data = CreateRFQSchema.parse(input);
    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: session.user.id,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        budget: data.budget,
        currency: data.currency,
        deadline: data.deadline ? new Date(data.deadline) : null,
        deliveryCountry: data.deliveryCountry,
        isPublic: data.isPublic,
        attachmentUrl: data.attachmentUrl,
        status: "OPEN",
        products: data.categoryId
          ? {
              create: [{ name: data.title }],
            }
          : undefined,
      },
      select: { id: true },
    });

    revalidatePath("/rfq");
    revalidatePath("/buyer/dashboard/rfqs");
    return { success: true as const, data: rfq };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create RFQ failed";
    return { success: false as const, error: message };
  }
}

const CreateRFQFromProductSchema = z.object({
  quantity: z.number().int().min(1),
  targetPrice: z.number().nonnegative().optional(),
  deliveryLocation: z.string().min(2).max(120),
  requiredBy: z.string().optional(),
  message: z.string().min(5).max(2000),
});

export async function createRFQFromProduct(productSlug: string, input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "BUYER") return { success: false as const, error: "Only buyers can send RFQs." };

    const slug = z.string().min(1).max(220).parse(productSlug);
    const data = CreateRFQFromProductSchema.parse(input);

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true, categoryId: true },
    });
    if (!product) return { success: false as const, error: "Product not found." };

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: session.user.id,
        title: `RFQ: ${product.name}`,
        description: [
          data.message,
          "",
          `Quantity: ${data.quantity}`,
          data.targetPrice !== undefined ? `Target price: ${data.targetPrice}` : null,
          `Delivery: ${data.deliveryLocation}`,
          data.requiredBy ? `Required by: ${data.requiredBy}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        quantity: data.quantity,
        unit: null,
        budget: data.targetPrice,
        currency: "USD",
        deadline: data.requiredBy ? new Date(data.requiredBy) : null,
        deliveryCountry: data.deliveryLocation,
        status: "OPEN",
        isPublic: false,
        products: { create: [{ productId: product.id, name: product.name }] },
      },
      select: { id: true },
    });

    revalidatePath("/buyer/dashboard/rfqs");
    return { success: true as const, data: rfq };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send RFQ failed";
    return { success: false as const, error: message };
  }
}

const PublicRFQFiltersSchema = z.object({
  categorySlug: z.string().optional(),
  country: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});

export const getPublicRFQs = cache(async (filters: unknown) => {
  const f = PublicRFQFiltersSchema.parse(filters);
  const where: any = { isPublic: true };
  if (f.country) where.deliveryCountry = { contains: f.country, mode: "insensitive" };
  if (f.categorySlug) {
    where.products = { some: { product: { category: { slug: f.categorySlug } } } };
  }

  const [items, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
      select: {
        id: true,
        title: true,
        quantity: true,
        budget: true,
        currency: true,
        deadline: true,
        deliveryCountry: true,
        createdAt: true,
        status: true,
        buyer: { select: { id: true } },
      },
    }),
    prisma.rFQ.count({ where }),
  ]);

  return { items, total, page: f.page, pageSize: f.pageSize, pageCount: Math.ceil(total / f.pageSize) };
});

