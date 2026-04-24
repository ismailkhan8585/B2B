import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClientWrapper } from "@/components/seller/layout/DashboardClientWrapper";
import type { SellerStats, SellerNotification } from "@/types/seller/layout.types";

export const runtime = "nodejs";

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companyId = session.user.companyId ?? null;
  const company = companyId
    ? await prisma.company.findUnique({
        where: { id: companyId },
        select: { verificationStatus: true },
      })
    : null;

  const [unreadMessagesCount, unreadNotificationsCount, rfqsCount] = await Promise.all([
    prisma.message.count({
      where: {
        conversation: { participants: { some: { userId: session.user.id } } },
        senderId: { not: session.user.id },
        isRead: false,
      },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
    prisma.rFQ.count({ where: { status: 'OPEN' } }),
  ]);

  const notifications: SellerNotification[] = [];
  const sellerStats: SellerStats = {
    unreadMessages: unreadMessagesCount,
    unreadNotifications: unreadNotificationsCount,
    newRFQs: rfqsCount,
    companyStatus: company?.verificationStatus || "UNVERIFIED",
  };

  // Server action to mark notification as read
  async function handleNotificationRead(id: string) {
    "use server";
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return (
    <DashboardClientWrapper
      stats={sellerStats}
      notifications={notifications}
      onNotificationRead={handleNotificationRead}
    >
      {children}
    </DashboardClientWrapper>
  );
}

