import Link from "next/link";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";

export default async function BuyerRFQsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const selectedId = typeof sp.id === "string" ? sp.id : null;

  const [rfqs, selected] = await Promise.all([
    prisma.rFQ.findMany({
      where: { buyerId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        deliveryCountry: true,
        responses: { select: { id: true } },
        products: { take: 1, select: { product: { select: { category: { select: { name: true } } } } } },
      },
    }),
    selectedId
      ? prisma.rFQ.findFirst({
          where: { id: selectedId, buyerId: session.user.id },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            responses: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                message: true,
                pricePerUnit: true,
                currency: true,
                leadTime: true,
                status: true,
                createdAt: true,
                company: { select: { name: true, slug: true, verificationStatus: true, country: true } },
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px] pb-16 md:pb-0">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
              My RFQs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Track status and review supplier quotations.</p>
          </div>
          <Button asChild style={{ background: "var(--accent)" }}>
            <Link href="/buyer/dashboard/rfqs/new">Post New RFQ</Link>
          </Button>
        </div>

        {rfqs.length ? (
          <div className="mt-4 divide-y divide-border">
            {rfqs.map((r) => (
              <Link
                key={r.id}
                href={`/buyer/dashboard/rfqs?id=${encodeURIComponent(r.id)}`}
                className="flex flex-col gap-2 py-3 hover:bg-muted/60 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{r.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.products[0]?.product?.category?.name ?? "—"} · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.status === "OPEN" ? "LIVE" : "PENDING"}>{r.status}</Badge>
                  <div className="text-xs text-muted-foreground">{r.responses.length} responses</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border p-8 text-center">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              No RFQs yet
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Post your first RFQ.</div>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-border bg-white p-6">
        {selected ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                {selected.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground">{selected.description}</p>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground">Quotation responses</div>
              {selected.responses.length ? (
                <div className="mt-2 space-y-2">
                  {selected.responses.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/suppliers/${q.company.slug}`} className="truncate text-sm font-semibold hover:underline">
                            {q.company.name}
                          </Link>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {q.company.country ?? "—"} · {q.company.verificationStatus}
                          </div>
                        </div>
                        <Badge variant={q.status === "PENDING" ? "PENDING" : q.status === "ACCEPTED" ? "BEST_SELLER" : "DISCOUNT"}>
                          {q.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{q.message}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Price: {q.pricePerUnit ? `${q.pricePerUnit} ${q.currency}` : "—"} · Lead time: {q.leadTime ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-xl border border-border p-6 text-sm text-muted-foreground">No quotations yet.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Select an RFQ to view details.</div>
        )}
      </aside>
    </div>
  );
}

