import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerProductEditor } from "./product-editor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/unauthorized");
  if (!session.user.companyId) redirect("/seller/dashboard/company/setup");

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      name: true,
      slug: true,
      shortDesc: true,
      description: true,
      categoryId: true,
      minOrderQty: true,
      minOrderUnit: true,
      currency: true,
      pricingNote: true,
      tags: true,
      status: true,
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, publicId: true, isPrimary: true, sortOrder: true } },
    },
  });
  if (!product) redirect("/seller/dashboard/products");
  if (product.companyId !== session.user.companyId) redirect("/unauthorized");

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, parentId: true },
  });

  return <SellerProductEditor product={product as any} categories={categories as any} />;
}

