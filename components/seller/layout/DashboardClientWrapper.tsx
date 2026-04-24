"use client";

import { useState } from "react";
import { SellerSidebar } from "@/components/seller/layout/SellerSidebar";
import { SellerTopbar } from "@/components/seller/layout/SellerTopbar";
import type { SellerStats, SellerNotification } from "@/types/seller/layout.types";

interface DashboardClientWrapperProps {
  stats: SellerStats;
  notifications: SellerNotification[];
  onNotificationRead: (id: string) => Promise<void>;
  children: React.ReactNode;
}

export function DashboardClientWrapper({
  stats,
  notifications,
  onNotificationRead,
  children,
}: DashboardClientWrapperProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar
          stats={stats}
          onMobileMenuToggle={toggleMobileMenu}
          isMobileOpen={isMobileSidebarOpen}
        />

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          {/* Topbar */}
          <SellerTopbar
            stats={stats}
            notifications={notifications}
            onMobileMenuToggle={toggleMobileMenu}
            onNotificationRead={onNotificationRead}
          />

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
