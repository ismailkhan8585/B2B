import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/shared/Badge";

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/unauthorized");
  if (!session.user.companyId) redirect("/seller/dashboard/company/setup");

  const items = await prisma.rFQResponse.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      status: true,
      pricePerUnit: true,
      currency: true,
      rfq: { select: { id: true, title: true, buyer: { select: { email: true } } } },
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Quotation workflow (responses to RFQs).</p>

      {items.length ? (
        <div className="mt-4 divide-y divide-border">
          {items.map((o) => (
            <div key={o.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{o.rfq.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Buyer: {o.rfq.buyer.email} · {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">{o.pricePerUnit ? `${o.pricePerUnit} ${o.currency}` : "—"}</div>
                <Badge variant={o.status === "ACCEPTED" ? "BEST_SELLER" : "PENDING"}>{o.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border p-8 text-center">
          <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            No quotations yet
          </div>
          <div className="mt-1 text-sm text-muted-foreground">Respond to buyer RFQs to generate activity.</div>
        </div>
      )}
    </div>
  );
}

