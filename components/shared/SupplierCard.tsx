import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SupplierCardData = {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
  logoUrl?: string | null;
  verificationStatus?: string | null;
  productCount?: number;
  responseRate?: number | null;
  onTimeDelivery?: number | null;
};

export function SupplierCard({ supplier, className }: { supplier: SupplierCardData; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
          {supplier.logoUrl ? (
            <Image src={supplier.logoUrl} alt={supplier.name} fill sizes="40px" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <Building2 size={18} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/suppliers/${supplier.slug}`} className="truncate text-sm font-semibold hover:underline">
              {supplier.name}
            </Link>
            {supplier.verificationStatus === "VERIFIED" ? <Badge variant="VERIFIED" /> : null}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{supplier.country ?? "—"}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Response rate</div>
          <div className="font-semibold">{supplier.responseRate ?? 0}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">On-time delivery</div>
          <div className="font-semibold">{supplier.onTimeDelivery ?? 0}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Products</div>
          <div className="font-semibold">{supplier.productCount ?? 0}</div>
        </div>
      </div>

      <Button asChild className="mt-4 w-full" variant="outline">
        <Link href={`/suppliers/${supplier.slug}`}>View Profile</Link>
      </Button>
    </div>
  );
}

