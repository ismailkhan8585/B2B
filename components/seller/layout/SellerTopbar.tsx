"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SellerStats, SellerNotification } from "@/types/seller/layout.types";

interface SellerTopbarProps {
  stats: SellerStats;
  notifications: SellerNotification[];
  onMobileMenuToggle: () => void;
  onNotificationRead: (notificationId: string) => void;
}

const notificationIcons: Record<string, typeof AlertCircle> = {
  rfq_response: AlertCircle,
  rfq_new: AlertCircle,
  message: User,
  system: Bell,
};

export function SellerTopbar({
  stats,
  notifications,
  onMobileMenuToggle,
  onNotificationRead,
}: SellerTopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleNotificationClick = (notification: SellerNotification) => {
    if (!notification.isRead) {
      onNotificationRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setNotificationsOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page title area */}
          <div className="hidden md:block">
            {/* Future: breadcrumb or page title */}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {stats.unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {stats.unreadNotifications > 99 ? '99+' : stats.unreadNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/seller/notifications')}
                >
                  View all
                </Button>
              </div>
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.slice(0, 5).map((notification) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'verification_rejected' ? 'bg-red-100' :
                              notification.type === 'verification_approved' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                notification.type === 'verification_rejected' ? 'text-red-600' :
                                notification.type === 'verification_approved' ? 'text-green-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.body}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {session?.user?.name || "Seller"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/seller/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/seller/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
