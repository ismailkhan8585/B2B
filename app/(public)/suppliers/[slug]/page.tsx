import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/shared/Badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { Button } from "@/components/ui/button";

export default async function SupplierProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "products";

  const company = await prisma.company.findUnique({
    where: { slug },
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
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: 24,
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
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
      receivedReviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, rating: true, title: true, comment: true, createdAt: true, author: { select: { name: true } } },
      },
      documents: { select: { id: true, name: true, type: true, fileUrl: true, status: true } },
    },
  });

  if (!company) notFound();

  const yearsOnPlatform = Math.max(0, Math.floor((Date.now() - new Date(company.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)));

  const tabs = [
    { key: "products", label: "Products" },
    { key: "about", label: "About" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="relative h-44 bg-muted md:h-56">
          {company.bannerUrl ? <Image src={company.bannerUrl} alt="" fill className="object-cover" sizes="100vw" /> : null}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4 md:p-6">
            <div className="flex items-end gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white md:h-16 md:w-16">
                {company.logoUrl ? <Image src={company.logoUrl} alt={company.name} fill className="object-cover" sizes="64px" /> : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-lg font-semibold text-white md:text-xl">{company.name}</div>
                  {company.verificationStatus === "VERIFIED" ? <Badge variant="VERIFIED" /> : null}
                </div>
                <div className="mt-1 text-sm text-white/80">
                  {company.country ? `${company.country}${company.city ? `, ${company.city}` : ""}` : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-4 md:p-6">
          <div>
            <div className="text-xs text-muted-foreground">Years on platform</div>
            <div className="mt-1 text-sm font-semibold">{yearsOnPlatform}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Response rate</div>
            <div className="mt-1 text-sm font-semibold">—</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">On-time delivery</div>
            <div className="mt-1 text-sm font-semibold">—</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total orders</div>
            <div className="mt-1 text-sm font-semibold">—</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <section className="flex-1">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button key={t.key} asChild variant={tab === t.key ? "default" : "outline"} size="sm">
                <Link href={`/suppliers/${company.slug}?tab=${t.key}`}>{t.label}</Link>
              </Button>
            ))}
          </div>

          {tab === "about" ? (
            <div className="mt-4 rounded-2xl border border-border bg-white p-6">
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                About
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground">{company.description ?? "No description provided yet."}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs font-semibold text-muted-foreground">Business type</div>
                  <div className="mt-1 text-sm">{company.businessType ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs font-semibold text-muted-foreground">Main categories</div>
                  <div className="mt-1 text-sm">{company.mainCategories?.length ? company.mainCategories.join(", ") : "—"}</div>
                </div>
              </div>

              {company.documents.length ? (
                <div className="mt-6">
                  <div className="text-xs font-semibold text-muted-foreground">Documents</div>
                  <div className="mt-2 space-y-2 text-sm">
                    {company.documents.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                        <div className="min-w-0 truncate">
                          {d.name} <span className="text-xs text-muted-foreground">({d.type})</span>
                        </div>
                        <a href={d.fileUrl} className="text-xs text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">
                          View →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : tab === "reviews" ? (
            <div className="mt-4 rounded-2xl border border-border bg-white p-6">
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                Reviews
              </div>
              {company.receivedReviews.length ? (
                <div className="mt-4 space-y-3">
                  {company.receivedReviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{r.title ?? "Review"}</div>
                        <div className="text-xs text-muted-foreground">{r.rating} / 5</div>
                      </div>
                      {r.comment ? <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p> : null}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {r.author.name ?? "Anonymous"} · {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-6 text-sm text-muted-foreground">No reviews yet.</div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {company.products.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {company.products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        ...p,
                        imageUrl: p.images[0]?.url ?? null,
                        company: { name: company.name, slug: company.slug, country: company.country, verificationStatus: company.verificationStatus },
                      } as any}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-white p-10 text-center">
                  <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                    No products yet
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">This supplier hasn’t published products.</div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="lg:w-[340px]">
          <div className="sticky top-24 rounded-2xl border border-border bg-white p-6">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Contact Supplier
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Start a conversation from your buyer dashboard.</p>
            <div className="mt-4">
              <StartChatButton companyId={company.id} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

