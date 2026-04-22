import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/shared/Badge";
import { RFQForm } from "@/components/shared/RFQForm";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { createRFQFromProduct } from "@/actions/rfq.actions";
import { Button } from "@/components/ui/button";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDesc: true,
      description: true,
      currency: true,
      priceMin: true,
      priceMax: true,
      minOrderQty: true,
      minOrderUnit: true,
      pricingNote: true,
      viewCount: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, altText: true, isPrimary: true } },
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          country: true,
          city: true,
          verificationStatus: true,
          createdAt: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!product) notFound();

  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category ? (
          <>
            {" "}
            /{" "}
            <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        ) : null}{" "}
        / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.1fr_420px]">
        <section className="space-y-3">
          <div className="rounded-2xl border border-border bg-white p-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
              {primaryImage ? (
                <Image src={primaryImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">No image</div>
              )}
            </div>
            {product.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.slice(0, 5).map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <Image src={img.url} alt={img.altText ?? product.name} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.company.verificationStatus === "VERIFIED" ? <Badge variant="VERIFIED">VERIFIED SUPPLIER</Badge> : null}
              {(product.viewCount ?? 0) > 500 ? <Badge variant="TOP_RATED" /> : null}
              <Badge variant="NEW">TRADE ASSURANCE</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold" style={{ color: "var(--primary)" }}>
              {product.name}
            </h1>
            {product.shortDesc ? <p className="mt-1 text-sm text-muted-foreground">{product.shortDesc}</p> : null}

            <div className="mt-4 rounded-xl border border-border p-4">
              <div className="text-xs font-semibold text-muted-foreground">Pricing</div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Range</div>
                  <div className="font-semibold">
                    {product.priceMin || product.priceMax ? `${product.priceMin ?? "—"} – ${product.priceMax ?? "—"} ${product.currency}` : "Price on request"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">MOQ</div>
                  <div className="font-semibold">
                    {product.minOrderQty} {product.minOrderUnit ?? ""}
                  </div>
                </div>
              </div>
              {product.pricingNote ? <div className="mt-2 text-xs text-muted-foreground">{product.pricingNote}</div> : null}
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-muted-foreground">Specifications</div>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 gap-0 text-sm">
                  <div className="border-b border-border p-3 text-muted-foreground">Category</div>
                  <div className="border-b border-border p-3">{product.category?.name ?? "—"}</div>
                  <div className="border-b border-border p-3 text-muted-foreground">Supplier</div>
                  <div className="border-b border-border p-3">
                    <Link href={`/suppliers/${product.company.slug}`} className="hover:underline">
                      {product.company.name}
                    </Link>
                  </div>
                  <div className="p-3 text-muted-foreground">Ships from</div>
                  <div className="p-3">
                    {product.company.country ? `${product.company.country}${product.company.city ? `, ${product.company.city}` : ""}` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {product.description ? (
              <div className="mt-4">
                <div className="text-xs font-semibold text-muted-foreground">Description</div>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">{product.description}</p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Request a Quote — Get pricing in &lt;2 hours
            </div>
            <div className="mt-4">
              <RFQForm action={async (v) => createRFQFromProduct(product.slug, v)} />
            </div>
            <div className="mt-3">
              <StartChatButton companyId={product.company.id} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="text-xs font-semibold text-muted-foreground">Supplier</div>
            <div className="mt-2 text-sm font-semibold">
              <Link href={`/suppliers/${product.company.slug}`} className="hover:underline">
                {product.company.name}
              </Link>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {product.company.country ? `${product.company.country}${product.company.city ? `, ${product.company.city}` : ""}` : "—"}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Response Rate</div>
                <div className="font-semibold">—</div>
              </div>
              <div>
                <div className="text-muted-foreground">On-time</div>
                <div className="font-semibold">—</div>
              </div>
              <div>
                <div className="text-muted-foreground">Repeat Buyers</div>
                <div className="font-semibold">—</div>
              </div>
              <div>
                <div className="text-muted-foreground">Annual Revenue</div>
                <div className="font-semibold">—</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/suppliers/${product.company.slug}`}>View Profile</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/products?category=${encodeURIComponent(product.category?.slug ?? "")}`}>All Products</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

