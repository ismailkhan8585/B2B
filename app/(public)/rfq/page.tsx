import Link from "next/link";

import { getPublicRFQs } from "@/actions/rfq.actions";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function RFQBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const country = typeof sp.country === "string" ? sp.country : undefined;

  const result = await getPublicRFQs({ categorySlug, country, page, pageSize: 20 });

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            RFQ Board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Public requirements posted by buyers. Sellers can submit quotations.</p>
        </div>
        {session?.user?.role === "BUYER" ? (
          <Button asChild style={{ background: "var(--accent)" }}>
            <Link href="/buyer/dashboard/rfqs/new">Post RFQ</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {result.items.length ? (
          result.items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold">{r.title}</div>
                    <Badge variant={r.status === "OPEN" ? "LIVE" : "PENDING"}>{r.status}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Quantity: {r.quantity} · Budget: {r.budget ? `${r.budget} ${r.currency}` : "—"} · Deadline:{" "}
                    {r.deadline ? new Date(r.deadline).toLocaleDateString() : "—"} · Location: {r.deliveryCountry ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Posted {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>

                {session?.user?.role === "SELLER" ? (
                  <Button asChild variant="outline">
                    <Link href={`/seller/dashboard/messages`}>Submit Quotation</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-border bg-white p-10 text-center">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              No RFQs yet
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Buyers can post the first one from their dashboard.</div>
          </div>
        )}
        <Pagination total={result.total} page={result.page} pageSize={result.pageSize} />
      </div>
    </main>
  );
}

