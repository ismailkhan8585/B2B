"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Edit,
  RotateCcw,
  Shield,
  Ban,
  XCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface UserActionMenuProps {
  onAction: (action: string) => void;
}

export function UserActionMenu({ userId, onAction }: UserActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("view")}>
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit")}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("reset-password")}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction("change-role")}>
          <Shield className="h-4 w-4 mr-2" />
          Change Role
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("suspend")}>
          <Ban className="h-4 w-4 mr-2" />
          Suspend
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("ban")}>
          <XCircle className="h-4 w-4 mr-2" />
          Ban
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("activate")}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Activate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction("delete")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}