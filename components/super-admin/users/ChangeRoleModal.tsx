"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Role } from "@prisma/client";

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: Role;
  userName: string;
  onConfirm: (newRole: Role) => void;
  isLoading?: boolean;
}

const roleOptions = [
  { value: "BUYER", label: "Buyer", description: "Can browse products and post RFQs" },
  { value: "SELLER", label: "Seller", description: "Can list products and respond to RFQs" },
  { value: "ADMIN", label: "Admin", description: "Has administrative privileges" },
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access" },
];

const roleColors = {
  BUYER: "default",
  SELLER: "secondary",
  ADMIN: "destructive",
  SUPER_ADMIN: "destructive",
} as const;

export function ChangeRoleModal({
  open,
  onOpenChange,
  currentRole,
  userName,
  onConfirm,
  isLoading = false,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRole(currentRole); // Reset on close
    }
    onOpenChange(newOpen);
  };

  const isSuperAdminChange = selectedRole === "SUPER_ADMIN" || currentRole === "SUPER_ADMIN";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for <strong>{userName}</strong>. This action will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Role</label>
            <div className="mt-1">
              <Badge variant={roleColors[currentRole]}>
                {currentRole.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSuperAdminChange && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Warning:</strong> You are changing Super Admin privileges.
                This action requires careful consideration and will be heavily audited.
              </div>
            </div>
          )}

          {selectedRole !== currentRole && (
            <div className="text-sm text-muted-foreground">
              Role will change from{" "}
              <Badge variant={roleColors[currentRole]} className="mx-1">
                {currentRole.replace('_', ' ')}
              </Badge>{" "}
              to{" "}
              <Badge variant={roleColors[selectedRole]} className="mx-1">
                {selectedRole.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedRole === currentRole || isLoading}
          >
            {isLoading ? "Changing..." : "Change Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}