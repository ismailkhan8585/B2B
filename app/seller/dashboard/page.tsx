export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { DashboardStatsRow } from "@/components/seller/dashboard/DashboardStatsRow";
import { RevenueTrendChart } from "@/components/seller/dashboard/RevenueTrendChart";
import { RecentRFQResponses } from "@/components/seller/dashboard/RecentRFQResponses";
import { RecentMessages } from "@/components/seller/dashboard/RecentMessages";
import type { RevenueData, RecentRFQResponse, RecentMessage } from "@/types/seller/dashboard.types";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = session.user.companyId ?? null;

  const [
    rfqCount,
    responseCount,
    savedSuppliersCount,
    unreadMessagesCount,
    revenueData,
    recentResponses,
    recentMessages,
  ] = await Promise.all([
    // Total RFQs (available leads)
    // Note: RFQs are buyer posts; all active RFQs count as leads
    // For now, get count of all open RFQs (excluding expired)
    prisma.rFQ.count({
      where: { status: 'OPEN' },
    }),
    // Total Responses (quotations sent by seller)
    companyId
      ? prisma.rFQResponse.count({
          where: { companyId },
        })
      : Promise.resolve(0),
    // Saved Suppliers placeholder
    Promise.resolve(0),
    // Unread messages
    prisma.message.count({
      where: {
        conversation: { participants: { some: { userId: session.user.id } } },
        senderId: { not: session.user.id },
        isRead: false,
      },
    }),
    // Revenue data (last 7 days) - deterministic mock
    Promise.resolve(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          revenue: 25000 + i * 8000, // deterministic mock
        };
      })
    ),
    // Recent RFQ Responses (quotations sent by seller)
    companyId
      ? prisma.rFQResponse.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            status: true,
            rfq: {
              select: {
                title: true,
                buyer: { select: { name: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    // Recent Messages
    prisma.message.findMany({
      where: {
        conversation: { participants: { some: { userId: session.user.id } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        isRead: true,
        sender: { select: { name: true, role: true } },
      },
    }),
  ]);

  const dashboardStats = {
    myRFQs: rfqCount,
    responsesReceived: responseCount,
    savedSuppliers: savedSuppliersCount,
    messages: unreadMessagesCount,
  };

  const formattedRevenueData: RevenueData[] = revenueData.map(d => ({
    date: d.date,
    revenue: d.revenue,
  }));

  const formattedRecentRFQs: RecentRFQResponse[] = recentResponses.map(r => ({
    id: r.id,
    rfqTitle: r.rfq.title,
    buyerName: r.rfq.buyer?.name || "Buyer",
    status: r.status,
    createdAt: r.createdAt,
  }));

  const formattedRecentMessages: RecentMessage[] = recentMessages.map(m => ({
    id: m.id,
    senderName: m.sender?.name || "Unknown",
    senderRole: m.sender?.role || "buyer",
    preview: m.content || "",
    timestamp: m.createdAt,
    isRead: m.isRead,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session.user.name || "Seller"}! Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Stats Row */}
      <section>
        <DashboardStatsRow stats={dashboardStats} />
      </section>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart - spans 2 columns */}
        <section className="lg:col-span-2">
          <RevenueTrendChart data={formattedRevenueData} period="7" />
        </section>

        {/* Recent Messages Panel - spans 1 column */}
        <section className="lg:col-span-1">
          <RecentMessages messages={formattedRecentMessages} />
        </section>
      </div>

      {/* Recent RFQs Table - full width below */}
      <section>
        <RecentRFQResponses responses={formattedRecentRFQs} />
      </section>
    </div>
  );
}

