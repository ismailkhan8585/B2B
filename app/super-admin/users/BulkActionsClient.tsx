"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserWithCompany } from "@/types/super-admin/users.types";
import { BulkActionBar } from "@/components/super-admin/users/BulkActionBar";

function BulkActionBarClient({ users }: { users: UserWithCompany[] }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    startTransition(async () => {
      try {
        // Import the bulk action function
        const { bulkUpdateUserStatus, bulkDeleteUsers } = await import("@/actions/super-admin/users.actions");

        let result;
        if (action === "delete") {
          result = await bulkDeleteUsers(selectedUsers);
        } else {
          const statusMap = {
            suspend: "SUSPENDED" as const,
            ban: "BANNED" as const,
            activate: "ACTIVE" as const,
          };
          result = await bulkUpdateUserStatus(selectedUsers, statusMap[action as keyof typeof statusMap], "Bulk action");
        }

        if (result.success) {
          toast.success(`Bulk ${action} completed: ${result.processed} processed, ${result.failed} failed`);
          setSelectedUsers([]);
          router.refresh();
        } else {
          toast.error(`Bulk ${action} failed: ${result.errors?.join(", ")}`);
        }
      } catch (error) {
        toast.error(`Failed to perform bulk ${action}`);
      }
    });
  };

  if (selectedUsers.length === 0) return null;

  return (
    <BulkActionBar
      selectedCount={selectedUsers.length}
      onBulkAction={handleBulkAction}
      onClearSelection={() => setSelectedUsers([])}
    />
  );
}

export default function BulkActionsClient({ users }: { users: UserWithCompany[] }) {
  return <BulkActionBarClient users={users} />;
}