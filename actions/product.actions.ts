"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

const ProductCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(10000).optional(),
  shortDesc: z.string().max(400).optional(),
  categoryId: z.string().cuid().optional().nullable(),
  minOrderQty: z.number().int().min(1).default(1),
  minOrderUnit: z.string().max(40).optional(),
  currency: z.string().min(3).max(6).default("USD"),
  pricingNote: z.string().max(200).optional(),
  tags: z.array(z.string().min(1).max(40)).default([]),
});

export async function createProduct(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can create products." };
    if (!session.user.companyId) return { success: false as const, error: "Create a company profile first." };

    const data = ProductCreateSchema.parse(input);

    const product = await prisma.product.create({
      data: {
        companyId: session.user.companyId,
        ...data,
        status: "DRAFT",
      },
      select: { id: true, slug: true, status: true },
    });

    revalidatePath("/seller/dashboard");
    revalidatePath("/products");
    return { success: true as const, data: product };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create product failed";
    return { success: false as const, error: message };
  }
}

const ProductUpdateSchema = ProductCreateSchema.partial();

export async function updateProduct(id: string, input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can update products." };

    const data = ProductUpdateSchema.parse(input);

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });
    if (!product) return { success: false as const, error: "Product not found." };
    if (!session.user.companyId || product.companyId !== session.user.companyId) return { success: false as const, error: "Forbidden" };

    const updated = await prisma.product.update({
      where: { id },
      data,
      select: { id: true, slug: true, status: true },
    });

    revalidatePath("/seller/dashboard");
    revalidatePath("/products");
    return { success: true as const, data: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update product failed";
    return { success: false as const, error: message };
  }
}

export async function publishProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can publish products." };
    if (!session.user.companyId) return { success: false as const, error: "Missing company profile." };

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { verificationStatus: true },
    });
    if (!company) return { success: false as const, error: "Company not found." };
    if (company.verificationStatus !== "VERIFIED") return { success: false as const, error: "Company must be verified to publish." };

    const product = await prisma.product.update({
      where: { id },
      data: { status: "ACTIVE" },
      select: { id: true, status: true, slug: true },
    });

    revalidatePath("/seller/dashboard");
    revalidatePath("/products");
    return { success: true as const, data: product };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    return { success: false as const, error: message };
  }
}

export async function uploadProductImages(productId: string, files: File[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can upload images." };
    if (!session.user.companyId) return { success: false as const, error: "Missing company profile." };

    const parsedId = z.string().cuid().parse(productId);
    const product = await prisma.product.findUnique({ where: { id: parsedId }, select: { id: true, companyId: true } });
    if (!product) return { success: false as const, error: "Product not found." };
    if (product.companyId !== session.user.companyId) return { success: false as const, error: "Forbidden" };

    const uploads = await Promise.all(
      files.map(async (file, idx) => {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image too large (max 5MB).");
        const { url, publicId } = await uploadToCloudinary(file, "b2b/products");
        return { url, publicId, sortOrder: idx };
      })
    );

    const created = await prisma.productImage.createMany({
      data: uploads.map((u) => ({ productId: parsedId, ...u })),
    });

    revalidatePath("/seller/dashboard");
    revalidatePath("/products");
    return { success: true as const, data: { count: created.count } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { success: false as const, error: message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can delete products." };
    if (!session.user.companyId) return { success: false as const, error: "Missing company profile." };

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, companyId: true, images: { select: { publicId: true } } },
    });
    if (!product) return { success: false as const, error: "Product not found." };
    if (product.companyId !== session.user.companyId) return { success: false as const, error: "Forbidden" };

    await prisma.product.update({ where: { id }, data: { status: "INACTIVE" }, select: { id: true } });
    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId).catch(() => undefined)));

    revalidatePath("/seller/dashboard");
    revalidatePath("/products");
    return { success: true as const, data: { id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { success: false as const, error: message };
  }
}

const GetProductsFiltersSchema = z.object({
  q: z.string().optional(),
  categorySlug: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(12),
});

export const getProducts = cache(async (filters: unknown) => {
  const f = GetProductsFiltersSchema.parse(filters);
  const where: any = { status: "ACTIVE" };

  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { shortDesc: { contains: f.q, mode: "insensitive" } },
      { description: { contains: f.q, mode: "insensitive" } },
    ];
  }

  if (f.categorySlug) {
    where.category = { slug: f.categorySlug };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        currency: true,
        priceMin: true,
        priceMax: true,
        company: { select: { id: true, name: true, slug: true, verificationStatus: true, logoUrl: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page: f.page,
    pageSize: f.pageSize,
    pageCount: Math.ceil(total / f.pageSize),
  };
});

