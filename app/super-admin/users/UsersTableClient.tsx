"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserWithCompany } from "@/types/super-admin/users.types";
import { UsersTable } from "@/components/super-admin/users/UsersTable";
import { UserDetailDrawer } from "@/components/super-admin/users/UserDetailDrawer";
import { ChangeRoleModal } from "@/components/super-admin/users/ChangeRoleModal";
import { ConfirmActionModal } from "@/components/super-admin/users/ConfirmActionModal";

function UsersTableInteractive({ users }: { users: UserWithCompany[] }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [detailUser, setDetailUser] = useState<UserWithCompany | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; user: UserWithCompany } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleViewUser = async (userId: string) => {
    startTransition(async () => {
      try {
        const { getUserDetail } = await import("@/actions/super-admin/users.actions");
        const user = await getUserDetail(userId);
        setDetailUser(user);
        setDetailOpen(true);
      } catch (error) {
        toast.error("Failed to load user details");
      }
    });
  };

  const handleUserAction = (userId: string, action: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (action === "view") {
      handleViewUser(userId);
    } else if (action === "change-role") {
      setPendingAction({ type: action, user });
      setChangeRoleOpen(true);
    } else {
      setPendingAction({ type: action, user });
      setConfirmActionOpen(true);
    }
  };

  const handleChangeRole = async (newRole: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN") => {
    if (!pendingAction?.user) return;

    startTransition(async () => {
      try {
        const { changeUserRole } = await import("@/actions/super-admin/users.actions");
        const result = await changeUserRole({
          userId: pendingAction.user.id,
          newRole,
        });

        if (result.success) {
          toast.success("User role changed successfully");
          setChangeRoleOpen(false);
          setPendingAction(null);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to change user role");
        }
      } catch (error) {
        toast.error("Failed to change user role");
      }
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!pendingAction?.user) return;

    const { type, user } = pendingAction;
    startTransition(async () => {
      try {
        const { changeUserStatus, deleteUser, resetUserPassword } = await import("@/actions/super-admin/users.actions");

        let result;
        let successMessage = "";

        if (type === "reset-password") {
          result = await resetUserPassword(user.id);
          successMessage = "Password reset email sent successfully";
        } else if (type === "delete") {
          result = await deleteUser(user.id);
          successMessage = "User deleted successfully";
        } else {
          const statusMap = {
            suspend: "SUSPENDED" as const,
            ban: "BANNED" as const,
            activate: "ACTIVE" as const,
          };
          result = await changeUserStatus({
            userId: user.id,
            newStatus: statusMap[type as keyof typeof statusMap],
            reason,
          });
          successMessage = `User ${type}d successfully`;
        }

        if (result.success) {
          toast.success(successMessage);
          setConfirmActionOpen(false);
          setPendingAction(null);
          router.refresh();
        } else {
          toast.error(result.error || `Failed to ${type} user`);
        }
      } catch (error) {
        toast.error(`Failed to ${type} user`);
      }
    });
  };

  return (
    <>
      <UsersTable
        users={users}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onViewUser={handleViewUser}
      />

      <UserDetailDrawer
        user={detailUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUserAction={handleUserAction}
      />

      <ChangeRoleModal
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        userId={pendingAction?.user?.id || ""}
        currentRole={pendingAction?.user?.role || "BUYER"}
        userName={pendingAction?.user?.name || pendingAction?.user?.email || ""}
        onConfirm={handleChangeRole}
        isLoading={isPending}
      />

      <ConfirmActionModal
        open={confirmActionOpen}
        onOpenChange={setConfirmActionOpen}
        action={pendingAction?.type as "suspend" | "ban" | "activate" | "delete" | "reset-password"}
        userName={pendingAction?.user?.name || ""}
        userEmail={pendingAction?.user?.email || ""}
        onConfirm={handleConfirmAction}
        isLoading={isPending}
      />
    </>
  );
}

export default function UsersTableClient({ users }: { users: UserWithCompany[] }) {
  return <UsersTableInteractive users={users} />;
}