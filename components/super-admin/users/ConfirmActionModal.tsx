"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Trash2, Ban, XCircle } from "lucide-react";

interface ConfirmActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "suspend" | "ban" | "activate" | "delete" | "reset-password";
  userName: string;
  userEmail: string;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

const actionConfig = {
  suspend: {
    title: "Suspend User",
    description: "Temporarily disable this user&apos;s access to the platform",
    icon: Ban,
    color: "destructive" as const,
    confirmText: "Suspend",
    requiresReason: true,
  },
  ban: {
    title: "Ban User",
    description: "Permanently ban this user from the platform",
    icon: XCircle,
    color: "destructive" as const,
    confirmText: "Ban User",
    requiresReason: true,
  },
  activate: {
    title: "Activate User",
    description: "Restore this user&apos;s access to the platform",
    icon: Ban,
    color: "default" as const,
    confirmText: "Activate",
    requiresReason: false,
  },
  delete: {
    title: "Delete User",
    description: "Permanently delete this user and all associated data",
    icon: Trash2,
    color: "destructive" as const,
    confirmText: "Delete User",
    requiresReason: false,
    showWarning: true,
  },
  "reset-password": {
    title: "Reset Password",
    description: "Send a password reset email to this user",
    icon: Ban,
    color: "default" as const,
    confirmText: "Reset Password",
    requiresReason: false,
  },
};

export function ConfirmActionModal({
  open,
  onOpenChange,
  action,
  userName,
  userEmail,
  onConfirm,
  isLoading = false,
}: ConfirmActionModalProps) {
  const [reason, setReason] = useState("");
  const config = actionConfig[action];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm(config.requiresReason ? reason : undefined);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason(""); // Reset on close
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-${config.color} bg-opacity-10`}>
              <Icon className={`h-6 w-6 text-${config.color}`} />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>User:</strong> {userName}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Email:</strong> {userEmail}
            </div>
          </div>

          {config.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {config.showWarning && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The user and all associated data will be permanently deleted.
              </div>
            </div>
          )}

          {action === "reset-password" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                A temporary password will be generated and sent to the user&apos;s email address.
                The user will be required to change their password on first login.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.color}
            onClick={handleConfirm}
            disabled={isLoading || (config.requiresReason && !reason.trim())}
          >
            {isLoading ? "Processing..." : config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}