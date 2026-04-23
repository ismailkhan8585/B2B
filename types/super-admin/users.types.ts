import { Role, UserStatus } from "@prisma/client";

export interface UserWithCompany {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
    products: {
      id: string;
      name: string;
      status: string;
      createdAt: Date;
    }[];
    documents: {
      id: string;
      name: string;
      type: string;
      fileUrl: string;
      status: string;
      uploadedAt: Date;
    }[];
  } | null;
  rfqs: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }[];
  conversations: {
    _count: {
      messages: number;
    };
  }[];
  auditLogs: {
    id: string;
    action: string;
    createdAt: Date;
    metadata?: any;
  }[];
}

export interface UserFilters {
  q?: string;
  role?: Role | "ALL";
  status?: UserStatus | "ALL";
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface UserPagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface UsersResponse {
  users: UserWithCompany[];
  pagination: UserPagination;
}

export interface UserActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

export interface ChangeRoleData {
  userId: string;
  newRole: Role;
}

export interface ChangeStatusData {
  userId: string;
  newStatus: UserStatus;
  reason?: string;
}