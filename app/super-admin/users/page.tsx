import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersFilters } from "@/components/super-admin/users/UsersFilters";
import { UsersTable } from "@/components/super-admin/users/UsersTable";
import { BulkActionBar } from "@/components/super-admin/users/BulkActionBar";
import { UserDetailDrawer } from "@/components/super-admin/users/UserDetailDrawer";
import { ChangeRoleModal } from "@/components/super-admin/users/ChangeRoleModal";
import { ConfirmActionModal } from "@/components/super-admin/users/ConfirmActionModal";
import { getAllUsers, getUserDetail, changeUserRole, changeUserStatus, deleteUser, resetUserPassword } from "@/actions/super-admin/users.actions";
import { UserFilters, UserWithCompany } from "@/types/super-admin/users.types";
import { Role, UserStatus } from "@prisma/client";

interface UsersPageProps {
  searchParams: {
    q?: string;
    role?: string;
    status?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  };
}

export default async function SuperAdminUsers({ searchParams }: UsersPageProps) {
  const filters: UserFilters = {
    q: searchParams.q,
    role: searchParams.role as Role | "ALL" | undefined,
    status: searchParams.status as UserStatus | "ALL" | undefined,
    country: searchParams.country,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    page: parseInt(searchParams.page || "1"),
    pageSize: 25,
  };

  const { users, pagination } = await getAllUsers(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users on the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersFilters
            filters={filters}
            onFiltersChange={() => {}} // Handled by client component
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Suspense fallback={<div>Loading bulk actions...</div>}>
        <BulkActionsClient users={users} />
      </Suspense>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading users...</div>}>
            <UsersTableClient users={users} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {users.length} of {pagination.total} users
        (Page {pagination.page} of {pagination.pageCount})
      </div>
    </div>
  );
}

// Client components for interactive functionality
import BulkActionsClient from "./BulkActionsClient";
import UsersTableClient from "./UsersTableClient";