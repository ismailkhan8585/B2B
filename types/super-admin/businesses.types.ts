import { CompanyVerificationStatus, SubscriptionPlan } from "@prisma/client";

export interface CompanyWithOwner {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  bannerUrl: string | null;
  bannerPublicId: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  employeeCount: string | null;
  yearEstablished: number | null;
  businessType: string | null;
  mainCategories: string[];
  verificationStatus: CompanyVerificationStatus;
  verifiedAt: Date | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
  };
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
  rfqResponses: {
    id: string;
    status: string;
    createdAt: Date;
  }[];
  _count: {
    products: number;
    rfqResponses: number;
  };
}

export interface CompanyFilters {
  q?: string;
  verificationStatus?: CompanyVerificationStatus | "ALL";
  subscriptionPlan?: SubscriptionPlan | "ALL";
  country?: string;
  isActive?: boolean | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CompanyPagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface CompaniesResponse {
  companies: CompanyWithOwner[];
  pagination: CompanyPagination;
}

export interface CompanyActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ChangeVerificationData {
  companyId: string;
  status: CompanyVerificationStatus;
  reason?: string;
}

export interface ChangeSubscriptionData {
  companyId: string;
  plan: SubscriptionPlan;
}

export interface EditCompanyData {
  companyId: string;
  name?: string;
  description?: string;
  businessType?: string;
  country?: string;
  website?: string;
  phone?: string;
  email?: string;
}