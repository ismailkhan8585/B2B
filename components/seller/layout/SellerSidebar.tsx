"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";
import type { SellerSidebarItem, SellerStats } from "@/types/seller/layout.types";

const sidebarItems: SellerSidebarItem[] = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/profile", label: "My Profile", icon: Building2 },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/rfqs", label: "RFQ Leads", icon: FileText },
  { href: "/seller/messages", label: "Messages", icon: MessageSquare },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/notifications", label: "Notifications", icon: Bell },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

interface SellerSidebarProps {
  stats: SellerStats;
  onMobileMenuToggle: () => void;
  isMobileOpen?: boolean;
}

export function SellerSidebar({ stats, onMobileMenuToggle, isMobileOpen }: SellerSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Update sidebar items with real-time stats
  const itemsWithBadges = sidebarItems.map(item => ({
    ...item,
    badge: item.href === "/seller/messages" ? stats.unreadMessages :
           item.href === "/seller/rfqs" ? stats.newRFQs :
           item.href === "/seller/notifications" ? stats.unreadNotifications :
           undefined
  }));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Seller Portal</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {itemsWithBadges.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => isMobileOpen && onMobileMenuToggle()}
            >
              <div className="flex items-center">
                <Icon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || "Seller"}
            </p>
            <div className="flex items-center space-x-2">
              <Badge
                variant={stats.companyStatus === 'VERIFIED' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {stats.companyStatus}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={onMobileMenuToggle}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}