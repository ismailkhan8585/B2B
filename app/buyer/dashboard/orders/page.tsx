import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/shared/Badge";

export default async function BuyerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Phase 2 approximation: treat accepted quotations as "orders".
  const items = await prisma.rFQResponse.findMany({
    where: { rfq: { buyerId: session.user.id }, status: "ACCEPTED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      rfq: { select: { id: true, title: true, quantity: true } },
      company: { select: { name: true, slug: true } },
      pricePerUnit: true,
      currency: true,
      status: true,
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Accepted quotations (Phase 2 order view).</p>

      {items.length ? (
        <div className="mt-4 divide-y divide-border">
          {items.map((o) => (
            <div key={o.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{o.rfq.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Supplier: {o.company.name} · {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">
                  {o.pricePerUnit ? `${o.pricePerUnit} ${o.currency}` : "—"}
                </div>
                <Badge variant="BEST_SELLER">{o.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border p-8 text-center">
          <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            No orders yet
          </div>
          <div className="mt-1 text-sm text-muted-foreground">When you accept a quotation, it will appear here.</div>
        </div>
      )}
    </div>
  );
}

