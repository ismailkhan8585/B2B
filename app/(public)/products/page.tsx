import Link from "next/link";

import { getProducts } from "@/actions/product.actions";
import { ProductCard } from "@/components/shared/ProductCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { getActiveCategoriesTree } from "@/lib/public-data";

function toNumber(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  return s === "true" || s === "1" ? true : s === "false" || s === "0" ? false : undefined;
}

function toArray(v: string | string[] | undefined) {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
  return v.split(",").map((x) => x.trim()).filter(Boolean);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, toNumber(sp.page) ?? 1);
  const pageSize = 24;

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;

  const featured = toBool(sp.featured);
  const verifiedOnly = toBool(sp.verified);
  const priceMin = toNumber(sp.priceMin);
  const priceMax = toNumber(sp.priceMax);
  const businessTypes = toArray(sp.supplierType);
  const shipsFrom = toArray(sp.shipsFrom);
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "top" || sp.sort === "new" ? (sp.sort as any) : "best";

  const [categoriesTree, result] = await Promise.all([
    getActiveCategoriesTree(),
    getProducts({ q, categorySlug, featured, verifiedOnly, priceMin, priceMax, businessTypes, shipsFrom, sort, page, pageSize }),
  ]);

  const verifiedSuppliers = new Set(result.items.map((p) => (p.company.verificationStatus === "VERIFIED" ? p.company.id : null)).filter(Boolean))
    .size;

  const breadcrumb = [
    { name: "Home", href: "/" },
    ...(categorySlug ? [{ name: categorySlug, href: `/categories/${categorySlug}` }] : []),
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-[280px]">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Filters
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Categories</div>
                <div className="mt-2 space-y-1 text-sm">
                  <Link href="/products" className="block rounded-md px-2 py-1 hover:bg-muted">
                    All
                  </Link>
                  {(categoriesTree ?? []).slice(0, 20).map((c) => (
                    <div key={c.id} className="space-y-1">
                      <Link
                        href={`/products?category=${encodeURIComponent(c.slug)}`}
                        className="block rounded-md px-2 py-1 hover:bg-muted"
                      >
                        {c.name}
                      </Link>
                      {(c.children ?? []).slice(0, 8).map((sc) => (
                        <Link
                          key={sc.id}
                          href={`/products?category=${encodeURIComponent(sc.slug)}`}
                          className="block rounded-md px-2 py-1 pl-5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {sc.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground">Supplier Type</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Manufacturer", "Trading Company"].map((t) => (
                    <Button key={t} asChild variant="outline" size="sm">
                      <Link href={`/products?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), supplierType: t }).toString()}`}>
                        {t}
                      </Link>
                    </Button>
                  ))}
                  <Button asChild variant={verifiedOnly ? "default" : "outline"} size="sm">
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...(categorySlug ? { category: categorySlug } : {}),
                        ...(verifiedOnly ? {} : { verified: "true" }),
                      }).toString()}`}
                    >
                      Verified Only
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                All filters are URL-driven. You can share links like{" "}
                <span className="font-mono">?category=machinery&amp;priceMin=500&amp;verified=true</span>.
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              {breadcrumb.map((b, idx) => (
                <span key={b.href}>
                  <Link href={b.href} className="hover:text-foreground">
                    {b.name}
                  </Link>
                  {idx < breadcrumb.length - 1 ? " / " : ""}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-white p-4 md:flex-row md:items-center">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  {result.total.toLocaleString()} products · {verifiedSuppliers.toLocaleString()} verified suppliers
                </div>
                <div className="text-xs text-muted-foreground">Server-side filtering with Prisma.</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs text-muted-foreground">Sort</div>
                {[
                  { label: "Best Match", v: "best" },
                  { label: "Price Low-High", v: "price_asc" },
                  { label: "Price High-Low", v: "price_desc" },
                  { label: "Top Rated", v: "top" },
                  { label: "Newest", v: "new" },
                ].map((o) => (
                  <Button key={o.v} asChild variant={sort === o.v ? "default" : "outline"} size="sm">
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...(q ? { q } : {}),
                        ...(categorySlug ? { category: categorySlug } : {}),
                        ...(featured ? { featured: "true" } : {}),
                        ...(verifiedOnly ? { verified: "true" } : {}),
                        ...(priceMin ? { priceMin: String(priceMin) } : {}),
                        ...(priceMax ? { priceMax: String(priceMax) } : {}),
                        sort: o.v,
                      }).toString()}`}
                    >
                      {o.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {result.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      ...p,
                      imageUrl: p.images[0]?.url ?? null,
                    } as any}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white p-10 text-center">
                <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  No products found
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Try removing filters or searching a different term.</div>
                <div className="mt-4 flex justify-center">
                  <Button asChild variant="outline">
                    <Link href="/products">Clear filters</Link>
                  </Button>
                </div>
              </div>
            )}

            <Pagination total={result.total} page={result.page} pageSize={result.pageSize} />
          </div>
        </section>
      </div>
    </main>
  );
}

