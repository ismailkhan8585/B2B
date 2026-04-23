"use client";

import { SellerSidebar } from "./SellerSidebar";
import type { SellerStats } from "@/types/seller/layout.types";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SellerStats;
}

export function MobileSidebarDrawer({ isOpen, onClose, stats }: MobileSidebarDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
        <SellerSidebar
          stats={stats}
          onMobileMenuToggle={onClose}
          isMobileOpen={isOpen}
        />
      </div>
    </div>
  );
}