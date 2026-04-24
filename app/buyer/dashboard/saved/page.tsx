export const runtime = "nodejs";

import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function BuyerSavedSuppliersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // No SavedSupplier model exists yet in the current schema.
  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Saved Suppliers
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Save suppliers to quickly re-contact them later.</p>

      <div className="mt-4 rounded-xl border border-border p-8 text-center">
        <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
          Nothing saved yet
        </div>
        <div className="mt-1 text-sm text-muted-foreground">Browse suppliers and start a conversation to keep track.</div>
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/suppliers">Browse Suppliers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

