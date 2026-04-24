import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, MessageSquare, PackageSearch, Send, Users } from "lucide-react";

export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { getMyConversations } from "@/actions/message.actions";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import { Session } from "next-auth";
import { MessagesClient } from "@/components/shared/MessagesClient";

export default async function BuyerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const buyerId = session.user.id;

  const [rfqCount, unreadMessages, recentRfqs, recentMessages] = await Promise.all([
    prisma.rFQ.count({ where: { buyerId } }),
    prisma.message.count({
      where: {
        conversation: { participants: { some: { userId: buyerId } } },
        senderId: { not: buyerId },
        isRead: false,
      },
    }),
    prisma.rFQ.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        responses: { select: { id: true } },
      },
    }),
    getMyConversations(),
  ]);

  if (!session.user) return null;

  const savedSuppliers = 0;
  const activeOrders = 0;

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your RFQs, responses, and messages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild style={{ background: "var(--accent)" }}>
            <Link href="/buyer/dashboard/rfqs/new">Post RFQ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/suppliers">Browse Suppliers</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Send size={18} />} label="My RFQs" value={rfqCount} />
        <StatCard icon={<MessageSquare size={18} />} label="Responses Received" value={unreadMessages} />
        <StatCard icon={<Users size={18} />} label="Saved Suppliers" value={savedSuppliers} />
        <StatCard icon={<Mail size={18} />} label="Messages" value={0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:grid-rows-[auto_1fr]">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                Recent RFQs
              </div>
              <div className="text-sm text-muted-foreground">Latest requirements you posted.</div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/buyer/dashboard/rfqs">View all</Link>
            </Button>
          </div>

          {recentRfqs.length ? (
            <div className="mt-4 divide-y divide-border">
    {recentRfqs.map((r) => (
                <Link
                  key={r.id}
                  href={`/buyer/dashboard/rfqs?id=${encodeURIComponent(r.id)}`}
                  className="flex flex-col gap-2 py-3 hover:bg-muted/60 md:flex-row md:items-center md:justify-between md:gap-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r?.responses?.[0]?.rfq?.products?.[0]?.product?.category?.name ?? "—"} · {new Date(r.createdAt).toLocaleDateString()}
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
            <div className="mt-1 text-sm text-muted-foreground">Post your first RFQ to start receiving quotations.</div>
            <div className="mt-4 flex justify-center">
              <Button asChild style={{ background: "var(--accent)" }}>
                <Link href="/buyer/dashboard/rfqs/new">Post RFQ</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="truncate text-sm font-semibold" style={{ color: "var(--primary)" }}>
                Recent Messages
              </div>
              <div className="text-xs text-muted-foreground">Latest messages from buyers and suppliers.</div>
            </div>
            <Button variant="outline" size="sm">
              <Link href="/buyer/dashboard/messages">View all</Link>
            </Button>
          </div>
          <div className="mt-4 h-[420px]">
            <MessagesClient meId={session.user.id} conversations={recentMessages as any} />
          </div>
        </div>
      </div>
    </div>
  );
}

