import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";

export default async function SellerProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/unauthorized");
  if (!session.user.companyId) redirect("/seller/dashboard/company/setup");

  const products = await prisma.product.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      currency: true,
      priceMin: true,
      priceMax: true,
      minOrderQty: true,
      minOrderUnit: true,
      viewCount: true,
      createdAt: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your catalog.</p>
        </div>
        <Button asChild style={{ background: "var(--accent)" }}>
          <Link href="/seller/dashboard/products/new">Add Product</Link>
        </Button>
      </div>

      {products.length ? (
        <div className="mt-4 divide-y divide-border">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {p.category?.name ?? "—"} · Views {p.viewCount} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={p.status === "ACTIVE" ? "LIVE" : "PENDING"}>{p.status}</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/seller/dashboard/products/${p.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/products/${p.slug}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border p-8 text-center">
          <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            No products yet
          </div>
          <div className="mt-1 text-sm text-muted-foreground">Create your first product listing.</div>
        </div>
      )}
    </div>
  );
}

