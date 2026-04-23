"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import { SellerSidebar } from "@/components/seller/layout/SellerSidebar";
import { SellerTopbar } from "@/components/seller/layout/SellerTopbar";
import { MobileSidebarDrawer } from "@/components/seller/layout/MobileSidebarDrawer";
import type { SellerStats, SellerNotification } from "@/types/seller/layout.types";

// Mock data for now - will be replaced with real data later
const mockStats: SellerStats = {
  unreadMessages: 3,
  unreadNotifications: 5,
  newRFQs: 12,
  companyStatus: 'PENDING',
  verificationMessage: 'Your documents are being reviewed',
};

const mockNotifications: SellerNotification[] = [
  {
    id: '1',
    title: 'New RFQ Response',
    body: 'ABC Corp responded to your Smart PCB Board listing',
    type: 'rfq_response',
    isRead: false,
    createdAt: new Date(),
    link: '/seller/rfqs',
  },
  {
    id: '2',
    title: 'New RFQ Posted',
    body: 'New RFQ for LED displays in Electronics category',
    type: 'rfq_new',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
    link: '/seller/rfqs',
  },
  {
    id: '3',
    title: 'Message Received',
    body: 'You have a new message from TechCorp',
    type: 'message',
    isRead: true,
    createdAt: new Date(Date.now() - 7200000),
    link: '/seller/messages',
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SellerStats>(mockStats);
  const [notifications, setNotifications] = useState<SellerNotification[]>(mockNotifications);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      redirect('/login?from=/seller');
      return;
    }

    if (session.user.role !== 'SELLER') {
      redirect('/unauthorized');
      return;
    }
  }, [session, status]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, fetch updated stats and notifications here
      // For now, we'll just simulate some changes
      setStats(prev => ({
        ...prev,
        unreadMessages: Math.max(0, prev.unreadMessages + Math.floor(Math.random() * 3) - 1),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setStats(prev => ({
      ...prev,
      unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading seller portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SellerSidebar
        stats={stats}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobileOpen={sidebarOpen}
      />

      {/* Mobile Sidebar */}
      <MobileSidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={stats}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <SellerTopbar
          stats={stats}
          notifications={notifications}
          onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNotificationRead={handleNotificationRead}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}