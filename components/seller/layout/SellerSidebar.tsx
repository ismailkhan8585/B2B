"use client";

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
  LogOut,
  Menu,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";
import type { SellerSidebarItem, SellerStats } from "@/types/seller/layout.types";

const sidebarItems: SellerSidebarItem[] = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/dashboard/company", label: "My Profile", icon: Building2 },
  { href: "/seller/dashboard/products", label: "Products", icon: Package },
  { href: "/seller/dashboard/orders", label: "RFQ Leads", icon: FileText },
  { href: "/seller/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/seller/dashboard/analytics", label: "Analytics", icon: BarChart3 },
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
    badge: item.href === "/seller/dashboard/messages" ? stats.unreadMessages :
           item.href === "/seller/dashboard/orders" ? stats.newRFQs :
           item.href === "/seller/dashboard/settings" ? stats.unreadNotifications :
           undefined
  }));

  const SidebarContent = (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--primary)" }}>
      {/* Header - dark navy */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">Seller Portal</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation - dark navy */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {itemsWithBadges.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-white/20 text-white border border-white/20"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
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

      <Separator className="bg-white/20" />

      {/* Footer - verification status and user info */}
      <div className="p-4 space-y-4">
        {/* Verification Status Banner */}
        {stats.companyStatus !== 'VERIFIED' && (
          <div className={`p-3 rounded-lg text-xs ${
            stats.companyStatus === 'REJECTED'
              ? 'bg-red-900/50 border border-red-700 text-red-100'
              : 'bg-amber-900/50 border border-amber-700 text-amber-100'
          }`}>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {stats.companyStatus === 'REJECTED'
                    ? 'Verification rejected'
                    : 'Verification pending'}
                </p>
                <p className="mt-1 opacity-80">
                  {stats.companyStatus === 'REJECTED'
                    ? 'Please resubmit your documents'
                    : 'Complete your profile to unlock all features'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border-2 border-white/20">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-white/20 text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "Seller"}
            </p>
            <div className="flex items-center space-x-1">
              {stats.companyStatus === 'VERIFIED' ? (
                <Badge variant="outline" className="text-xs bg-green-600/20 border-green-500/50 text-green-100">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                  {stats.companyStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-white/10">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onMobileMenuToggle}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10">
            {SidebarContent}
          </div>
        </>
      )}
    </>
  );
}