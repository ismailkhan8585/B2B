import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = session.user.companyId ?? null;

  const [company, products] = await Promise.all([
    companyId
      ? prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true, name: true, slug: true, verificationStatus: true },
        })
      : Promise.resolve(null),
    companyId ? prisma.product.count({ where: { companyId } }) : Promise.resolve(0),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        {company ? (
          <Button asChild variant="outline">
            <Link href={`/suppliers/${company.slug}`}>View public profile</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/seller/dashboard/company/setup">Create company profile</Link>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Your catalog size</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{products}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Leads</CardTitle>
            <CardDescription>Coming in Phase 2</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>RFQ Responses</CardTitle>
            <CardDescription>Coming in Phase 2</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Company Status</CardTitle>
            <CardDescription>Verification</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{company?.verificationStatus ?? "NO_PROFILE"}</CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/seller/dashboard">Messages (Phase 2)</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/seller/dashboard">View RFQs (Phase 2)</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/seller/dashboard">Add Product (Phase 1 action ready)</Link>
        </Button>
      </div>
    </main>
  );
}

