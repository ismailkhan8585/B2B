"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

const CompanyCreateSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(5000).optional(),
  website: z.string().url().optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  address: z.string().max(240).optional(),
  employeeCount: z.string().max(80).optional(),
  yearEstablished: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  businessType: z.string().max(120).optional(),
  mainCategories: z.array(z.string().min(1).max(80)).default([]),
});

export async function createCompany(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
    if (session.user.role !== "SELLER") return { success: false as const, error: "Only sellers can create a company." };

    const data = CompanyCreateSchema.parse(input);

    const company = await prisma.company.create({
      data: { ...data, userId: session.user.id },
      select: { id: true, slug: true },
    });

    revalidatePath("/seller/dashboard");
    revalidatePath(`/suppliers/${company.slug}`);
    return { success: true as const, data: company };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create company failed";
    return { success: false as const, error: message };
  }
}

const CompanyUpdateSchema = CompanyCreateSchema.partial();

export async function updateCompany(id: string, input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const data = CompanyUpdateSchema.parse(input);

    const company = await prisma.company.findUnique({ where: { id }, select: { id: true, userId: true, slug: true } });
    if (!company) return { success: false as const, error: "Company not found." };
    if (company.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false as const, error: "Forbidden" };
    }

    const updated = await prisma.company.update({
      where: { id },
      data,
      select: { id: true, slug: true, verificationStatus: true },
    });

    revalidatePath("/seller/dashboard");
    revalidatePath(`/suppliers/${updated.slug}`);
    return { success: true as const, data: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update company failed";
    return { success: false as const, error: message };
  }
}

export async function uploadCompanyDocument(companyId: string, file: File, type: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, userId: true } });
    if (!company) return { success: false as const, error: "Company not found." };
    if (company.userId !== session.user.id) return { success: false as const, error: "Forbidden" };

    const parsedType = z.string().min(1).max(80).parse(type);
    if (file.size > 20 * 1024 * 1024) return { success: false as const, error: "File too large (max 20MB)." };

    const { url, publicId } = await uploadToCloudinary(file, "b2b/company-docs");
    const doc = await prisma.companyDocument.create({
      data: {
        companyId,
        name: file.name,
        type: parsedType,
        fileUrl: url,
        publicId,
      },
      select: { id: true, fileUrl: true, status: true },
    });

    revalidatePath("/seller/dashboard");
    return { success: true as const, data: doc };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { success: false as const, error: message };
  }
}

export const getCompanyBySlug = cache(async (slug: string) => {
  const parsed = z.string().min(1).max(160).parse(slug);
  return prisma.company.findUnique({
    where: { slug: parsed },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      website: true,
      country: true,
      city: true,
      businessType: true,
      mainCategories: true,
      verificationStatus: true,
      createdAt: true,
    },
  });
});

const SuppliersFiltersSchema = z.object({
  q: z.string().optional(),
  country: z.string().optional(),
  verification: z.enum(["VERIFIED", "PENDING", "UNVERIFIED", "REJECTED"]).optional(),
  businessType: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(24),
});

export const getSuppliers = cache(async (filters: unknown) => {
  const f = SuppliersFiltersSchema.parse(filters);
  const where: any = { isActive: true };
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { slug: { contains: f.q, mode: "insensitive" } },
      { country: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.country) where.country = { contains: f.country, mode: "insensitive" };
  if (f.verification) where.verificationStatus = f.verification;
  if (f.businessType) where.businessType = { contains: f.businessType, mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: [{ verificationStatus: "desc" }, { createdAt: "desc" }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        logoUrl: true,
        verificationStatus: true,
        products: { where: { status: "ACTIVE" }, select: { id: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    items: items.map((c) => ({ ...c, productCount: c.products.length })),
    total,
    page: f.page,
    pageSize: f.pageSize,
    pageCount: Math.ceil(total / f.pageSize),
  };
});

