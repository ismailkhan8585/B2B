import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

type ProductCardCompany = {
  name: string;
  slug: string;
  verificationStatus?: string | null;
  country?: string | null;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  currency?: string | null;
  priceMin?: any;
  priceMax?: any;
  minOrderQty?: number | null;
  minOrderUnit?: string | null;
  viewCount?: number | null;
  createdAt?: Date | string | null;
  imageUrl?: string | null;
  company: ProductCardCompany;
};

function formatMoney(v: any, currency: string) {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return null;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function getFlag(country?: string | null) {
  if (!country) return "🌍";
  // Best-effort: if already emoji, return it; otherwise globe.
  return country.match(/[\u{1F1E6}-\u{1F1FF}]/u) ? country : "🌍";
}

function deriveBadge(p: ProductCardData): BadgeVariant | null {
  if (p.company.verificationStatus === "VERIFIED") return "VERIFIED";
  const created = p.createdAt ? new Date(p.createdAt) : null;
  if (created && Date.now() - created.getTime() < 1000 * 60 * 60 * 24 * 14) return "NEW";
  if ((p.viewCount ?? 0) > 500) return "TOP_RATED";
  return null;
}

export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const badge = deriveBadge(product);
  const currency = product.currency ?? "USD";

  const price =
    product.priceMin || product.priceMax
      ? [formatMoney(product.priceMin, currency), formatMoney(product.priceMax, currency)].filter(Boolean).join(" – ")
      : product.currency
        ? null
        : null;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <div className="flex items-center gap-2 text-xs">
                <ImageIcon size={16} />
                No image
              </div>
            </div>
          )}
          {badge ? <div className="absolute left-3 top-3"><Badge variant={badge} /></div> : null}
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
          {product.name}
        </Link>
        <div className="text-xs text-muted-foreground">
          {product.company.name} · {getFlag(product.company.country)} {product.company.country ?? ""}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {price ?? "Price on request"}
              {product.minOrderUnit ? <span className="text-muted-foreground"> / {product.minOrderUnit}</span> : null}
            </div>
            <div className="text-xs text-muted-foreground">
              Min. order: {product.minOrderQty ?? 1}
              {product.minOrderUnit ? ` ${product.minOrderUnit}` : ""}
            </div>
          </div>
        </div>

        <Button asChild className="w-full" variant="outline">
          <Link href={`/suppliers/${product.company.slug}`}>Contact Supplier</Link>
        </Button>
      </div>
    </div>
  );
}

