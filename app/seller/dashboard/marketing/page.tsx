import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function SellerMarketingPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Marketing
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Sponsored listings and campaigns will be enabled in a later iteration.</p>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/seller/dashboard/products">Go to Products</Link>
        </Button>
      </div>
    </div>
  );
}

