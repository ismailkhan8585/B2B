"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users as UsersIcon, Ban, XCircle, CheckCircle, Trash2 } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onBulkAction,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction("suspend")}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction("ban")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ban
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction("activate")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}