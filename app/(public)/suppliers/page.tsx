import Link from "next/link";

import { getSuppliers } from "@/actions/company.actions";
import { SupplierCard } from "@/components/shared/SupplierCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const country = typeof sp.country === "string" ? sp.country : undefined;
  const verification = typeof sp.verification === "string" ? (sp.verification as any) : undefined;
  const businessType = typeof sp.businessType === "string" ? sp.businessType : undefined;

  const result = await getSuppliers({ q, country, verification, businessType, page, pageSize: 24 });

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Supplier Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Search by company name, country, or business type.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/register">Join Free</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-border bg-white p-4">
          <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            Filters
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Verification</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["VERIFIED", "PENDING", "UNVERIFIED"].map((s) => (
                  <Button key={s} asChild variant={verification === s ? "default" : "outline"} size="sm">
                    <Link href={`/suppliers?verification=${encodeURIComponent(s)}`}>{s}</Link>
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: use URL params like <span className="font-mono">?country=Turkey&amp;verification=VERIFIED</span>.
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {result.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((c) => (
                <SupplierCard
                  key={c.id}
                  supplier={{
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    country: c.country,
                    logoUrl: c.logoUrl,
                    verificationStatus: c.verificationStatus,
                    productCount: (c as any).productCount,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white p-10 text-center">
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                No suppliers found
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Try removing filters.</div>
              <div className="mt-4 flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/suppliers">Clear filters</Link>
                </Button>
              </div>
            </div>
          )}

          <Pagination total={result.total} page={result.page} pageSize={result.pageSize} />
        </section>
      </div>
    </main>
  );
}

