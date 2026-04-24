export const runtime = "nodejs";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerCompanyEditor } from "./seller-company-editor";

export default async function SellerCompanyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/unauthorized");
  if (!session.user.companyId) redirect("/seller/dashboard/company/setup");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      website: true,
      phone: true,
      email: true,
      country: true,
      city: true,
      address: true,
      employeeCount: true,
      yearEstablished: true,
      businessType: true,
      mainCategories: true,
      verificationStatus: true,
      documents: { orderBy: { uploadedAt: "desc" }, select: { id: true, name: true, type: true, fileUrl: true, status: true } },
    },
  });
  if (!company) redirect("/seller/dashboard/company/setup");

  return <SellerCompanyEditor company={company as any} />;
}

