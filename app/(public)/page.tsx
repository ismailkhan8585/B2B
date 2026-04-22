import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/shared/Badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { getCategoryCounts, getActiveCategoriesTree } from "@/lib/public-data";

export default async function HomePage() {
  const [stats, categoriesTree, categoryCounts, featured] = await Promise.all([
    Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.company.count({ where: { country: { not: null } } }),
    ]),
    getActiveCategoriesTree(),
    getCategoryCounts(),
    prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        priceMin: true,
        priceMax: true,
        minOrderQty: true,
        minOrderUnit: true,
        viewCount: true,
        createdAt: true,
        company: { select: { name: true, slug: true, country: true, verificationStatus: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const [suppliersCount, productsCount, countriesWithSuppliers] = stats;

  const topCategories = categoriesTree
    .flatMap((c) => [c, ...(c.children ?? [])])
    .slice(0, 8)
    .map((c) => ({ ...c, productCount: categoryCounts.get(c.id) ?? 0 }));

  const featuredProducts = featured.map((p) => ({
    ...p,
    imageUrl: p.images[0]?.url ?? null,
  }));

  const todaysDeal = featuredProducts[0] ?? null;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight" style={{ fontSize: "var(--font-display)", color: "var(--primary)" }}>
            Source from 50,000+ verified suppliers worldwide
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Bulk pricing · Secure escrow · Global logistics — all in one platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild style={{ background: "var(--accent)" }}>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Suppliers</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>
                {suppliersCount ? `${suppliersCount.toLocaleString()}+` : "50K+"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Products</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>
                {productsCount ? `${productsCount.toLocaleString()}+` : "2.5M+"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Countries</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>
                {countriesWithSuppliers ? `${countriesWithSuppliers.toLocaleString()}+` : "180+"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">On-time</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>
                99.2%
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Today’s Deal
            </div>
            <div className="text-sm text-muted-foreground">Featured product picked from real inventory.</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/products?featured=true">View all →</Link>
          </Button>
        </div>

        {todaysDeal ? (
          <div className="relative">
            <div className="absolute left-4 top-4 z-10">
              <Badge variant="DISCOUNT">TODAY&apos;S DEAL</Badge>
            </div>
            <ProductCard product={todaysDeal as any} className="md:max-w-[520px]" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white p-6 text-sm text-muted-foreground">
            No featured products yet. Sellers can feature products from the admin panel.
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Shop by Category
            </div>
            <div className="text-sm text-muted-foreground">Browse categories sourced from the database.</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/categories">View all categories →</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="rounded-xl border border-border bg-white p-4 hover:border-[color:var(--accent)]"
            >
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{(c.productCount ?? 0).toLocaleString()} products</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Featured Products
            </div>
            <div className="text-sm text-muted-foreground">Real products marked as featured.</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/products?featured=true">View all →</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </section>
    </main>
  );
}

