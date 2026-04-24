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
  console.log("Starting publishProduct for id:", id);
  try {
    // Validate product ID
    const parsedId = z.string().cuid().parse(id);
    console.log("Parsed ID:", parsedId);

    const session = await auth();
    console.log("Session:", session ? "exists" : "null");
    if (!session?.user?.id) {
      console.log("No session user");
      return { success: false as const, error: "Unauthorized" };
    }
    if (session.user.role !== "SELLER") {
      console.log("User is not seller:", session.user.role);
      return { success: false as const, error: "Only sellers can publish products." };
    }
    if (!session.user.companyId) {
      console.log("No company ID");
      return { success: false as const, error: "Missing company profile." };
    }

    // Check if product exists and belongs to the seller
    console.log("Checking product existence");
    const productCheck = await prisma.product.findUnique({
      where: { id: parsedId },
      select: { id: true, companyId: true, status: true },
    });
    console.log("Product check result:", productCheck);
    if (!productCheck) {
      console.log("Product not found");
      return { success: false as const, error: "Product not found." };
    }
    if (productCheck.companyId !== session.user.companyId) {
      console.log("Product doesn't belong to user");
      return { success: false as const, error: "Forbidden" };
    }

    console.log("Checking company verification");
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { verificationStatus: true },
    });
    console.log("Company result:", company);
    if (!company) {
      console.log("Company not found");
      return { success: false as const, error: "Company not found." };
    }
    if (company.verificationStatus !== "VERIFIED") {
      console.log("Company not verified:", company.verificationStatus);
      return { success: false as const, error: "Company must be verified to publish." };
    }

    console.log("Updating product status");
    const product = await prisma.product.update({
      where: { id: parsedId },
      data: { status: "ACTIVE" },
      select: { id: true, status: true, slug: true },
    });
    console.log("Product update result:", product);

    // Note: revalidatePath might cause issues in some Next.js versions
    try {
      console.log("Revalidating paths");
      revalidatePath("/seller/dashboard");
      revalidatePath("/products");
    } catch (revalidateError) {
      console.warn("Revalidation failed:", revalidateError);
    }

    console.log("Publish successful");
    return { success: true as const, data: product };
  } catch (err) {
    console.error("Publish product error:", err);
    console.error("Error type:", typeof err);
    console.error("Error keys:", err ? Object.keys(err) : "err is null/undefined");

    // More robust error message extraction
    let message = "Publish failed";
    if (err) {
      if (typeof err === 'string') {
        message = err;
      } else if (typeof err === 'object') {
        if ('message' in err && typeof (err as any).message === 'string') {
          message = (err as any).message;
        } else if ('toString' in err) {
          message = String(err);
        }
      }
    }

    console.log("Final error message:", message);
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
  featured: z.boolean().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  verifiedOnly: z.boolean().optional(),
  businessTypes: z.array(z.string()).optional(),
  shipsFrom: z.array(z.string()).optional(),
  sort: z.enum(["best", "price_asc", "price_desc", "top", "new"]).default("best"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(24),
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

  if (f.featured) where.isFeatured = true;

  if (typeof f.priceMin === "number" || typeof f.priceMax === "number") {
    where.AND = where.AND ?? [];
    if (typeof f.priceMin === "number") where.AND.push({ priceMax: { gte: f.priceMin } });
    if (typeof f.priceMax === "number") where.AND.push({ priceMin: { lte: f.priceMax } });
  }

  if (f.verifiedOnly) {
    where.company = { ...(where.company ?? {}), verificationStatus: "VERIFIED" };
  }

  if (f.businessTypes?.length) {
    where.company = { ...(where.company ?? {}), businessType: { in: f.businessTypes } };
  }

  if (f.shipsFrom?.length) {
    where.company = { ...(where.company ?? {}), country: { in: f.shipsFrom } };
  }

  const orderBy =
    f.sort === "price_asc"
      ? [{ priceMin: "asc" as const }, { createdAt: "desc" as const }]
      : f.sort === "price_desc"
        ? [{ priceMin: "desc" as const }, { createdAt: "desc" as const }]
        : f.sort === "top"
          ? [{ viewCount: "desc" as const }, { createdAt: "desc" as const }]
          : f.sort === "new"
            ? [{ createdAt: "desc" as const }]
            : [{ viewCount: "desc" as const }, { createdAt: "desc" as const }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
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
      minOrderQty: true,
      minOrderUnit: true,
      viewCount: true,
      company: { select: { id: true, name: true, slug: true, verificationStatus: true, logoUrl: true, country: true, businessType: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
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

