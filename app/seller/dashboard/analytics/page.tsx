export const runtime = "nodejs";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export default async function SellerAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/unauthorized");
  if (!session.user.companyId) redirect("/seller/dashboard/company/setup");

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const products = await prisma.product.findMany({
    where: { companyId: session.user.companyId, createdAt: { gte: since } },
    select: { createdAt: true, viewCount: true },
  });

  const byDay = new Map<string, { day: string; views: number; products: number }>();
  for (const p of products) {
    const day = p.createdAt.toISOString().slice(0, 10);
    const row = byDay.get(day) ?? { day, views: 0, products: 0 };
    row.views += p.viewCount ?? 0;
    row.products += 1;
    byDay.set(day, row);
  }

  const data = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Analytics
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Last 30 days (products created & total views).</p>
      <div className="mt-4">
        <AnalyticsClient data={data} />
      </div>
    </div>
  );
}

