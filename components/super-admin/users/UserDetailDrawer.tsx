"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Activity,
  Clock,
} from "lucide-react";
import { UserActionMenu } from "./UserActionMenu";
import type { UserWithCompany } from "@/types/super-admin/users.types";

interface UserDetailDrawerProps {
  user: UserWithCompany | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAction: (userId: string, action: string) => void;
}

const roleColors = {
  BUYER: "default",
  SELLER: "secondary",
  ADMIN: "destructive",
  SUPER_ADMIN: "destructive",
} as const;

const statusColors = {
  ACTIVE: "default",
  SUSPENDED: "destructive",
  PENDING_VERIFICATION: "secondary",
  BANNED: "destructive",
} as const;

export function UserDetailDrawer({ user, open, onOpenChange, onUserAction }: UserDetailDrawerProps) {
  if (!user) return null;

  const handleAction = (action: string) => {
    onUserAction(user.id, action);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>User Details</DrawerTitle>
          <div className="flex items-center space-x-2">
            <UserActionMenu userId={user.id} onAction={handleAction} />
            <DrawerClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* User Profile Header */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-xl font-semibold">
                    {user.name || "Unnamed User"}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={roleColors[user.role]}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                  <Badge variant={statusColors[user.status]}>
                    {user.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Company Information */}
            {user.company && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <p className="text-sm text-muted-foreground">{user.company.name}</p>
                  </div>
                  {user.company.country && (
                    <div>
                      <Label className="text-sm font-medium">Country</Label>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {user.company.country}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <Badge variant={user.company.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                    {user.company.verificationStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            )}

            <Separator />

            {/* Activity Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.company?.products?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.rfqs?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">RFQs</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{user.conversations?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {user.conversations?.reduce((acc, conv) => acc + conv._count.messages, 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            {user.company?.products && user.company.products.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Products ({user.company.products.length})
                  </h3>
                  <div className="space-y-2">
                    {user.company.products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {product.status} • Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Recent RFQs */}
            {user.rfqs && user.rfqs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent RFQs ({user.rfqs.length})
                  </h3>
                  <div className="space-y-2">
                    {user.rfqs.slice(0, 5).map((rfq) => (
                      <div key={rfq.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{rfq.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {rfq.status} • Created: {new Date(rfq.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={rfq.status === 'OPEN' ? 'default' : 'secondary'}>
                          {rfq.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Audit Log */}
            {user.auditLogs && user.auditLogs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity ({user.auditLogs.length})
                  </h3>
                  <div className="space-y-2">
                    {user.auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{log.action.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-sm font-medium text-foreground ${className}`}>
      {children}
    </div>
  );
}