import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessesFilters } from "@/components/super-admin/businesses/BusinessesFilters";
import { BusinessesTable } from "@/components/super-admin/businesses/BusinessesTable";
import { BusinessDetailDrawer } from "@/components/super-admin/businesses/BusinessDetailDrawer";
import { ChangeSubscriptionModal } from "@/components/super-admin/businesses/ChangeSubscriptionModal";
import { getAllCompanies, getCompanyDetail, changeCompanyVerification, changeCompanySubscription, toggleCompanyActive, toggleCompanyFeatured, editCompany, deleteCompany } from "@/actions/super-admin/businesses.actions";
import { CompanyFilters } from "@/types/super-admin/businesses.types";
import { CompanyVerificationStatus, SubscriptionPlan } from "@prisma/client";

interface BusinessesPageProps {
  searchParams: {
    q?: string;
    verificationStatus?: string;
    subscriptionPlan?: string;
    country?: string;
    isActive?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  };
}

export default async function SuperAdminBusinesses({ searchParams }: BusinessesPageProps) {
  const filters: CompanyFilters = {
    q: searchParams.q,
    verificationStatus: searchParams.verificationStatus as CompanyVerificationStatus | "ALL" | undefined,
    subscriptionPlan: searchParams.subscriptionPlan as SubscriptionPlan | "ALL" | undefined,
    country: searchParams.country,
    isActive: searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : "ALL",
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    page: parseInt(searchParams.page || "1"),
    pageSize: 25,
  };

  const { companies, pagination } = await getAllCompanies(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">
            Manage all companies and their verifications on the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessesFilters
            filters={filters}
            onFiltersChange={() => {}} // Handled by client component
          />
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading companies...</div>}>
            <BusinessesTableClient companies={companies} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {companies.length} of {pagination.total} companies
        (Page {pagination.page} of {pagination.pageCount})
      </div>
    </div>
  );
}

// Client components for interactive functionality
function BusinessesTableClient({ companies }: { companies: any[] }) {
  return <BusinessesTableInteractive companies={companies} />;
}

// Interactive Companies Table
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CompanyWithOwner } from "@/types/super-admin/businesses.types";

function BusinessesTableInteractive({ companies }: { companies: CompanyWithOwner[] }) {
  const [detailCompany, setDetailCompany] = useState<CompanyWithOwner | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [changeSubscriptionOpen, setChangeSubscriptionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; company: CompanyWithOwner } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleViewCompany = async (companyId: string) => {
    startTransition(async () => {
      try {
        const company = await getCompanyDetail(companyId);
        setDetailCompany(company);
        setDetailOpen(true);
      } catch (error) {
        toast.error("Failed to load company details");
      }
    });
  };

  const handleCompanyAction = (companyId: string, action: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    if (action === "view") {
      handleViewCompany(companyId);
    } else if (action === "change-subscription") {
      setPendingAction({ type: action, company });
      setChangeSubscriptionOpen(true);
    } else {
      // Handle other actions directly
      handleDirectAction(company, action);
    }
  };

  const handleDirectAction = async (company: CompanyWithOwner, action: string) => {
    startTransition(async () => {
      try {
        let result;
        let successMessage = "";

        switch (action) {
          case "approve-verification":
            result = await changeCompanyVerification({
              companyId: company.id,
              status: "VERIFIED",
            });
            successMessage = "Company verification approved successfully";
            break;
          case "reject-verification":
            // In a real app, you'd show a modal to get rejection reason
            result = await changeCompanyVerification({
              companyId: company.id,
              status: "REJECTED",
              reason: "Rejected by super admin",
            });
            successMessage = "Company verification rejected";
            break;
          case "toggle-active":
            result = await toggleCompanyActive(company.id);
            successMessage = `Company ${result.data?.isActive ? 'activated' : 'deactivated'} successfully`;
            break;
          case "toggle-featured":
            result = await toggleCompanyFeatured(company.id);
            successMessage = `Company ${result.data?.isFeatured ? 'featured' : 'unfeatured'} successfully`;
            break;
          case "delete":
            if (confirm(`Are you sure you want to delete ${company.name}? This action cannot be undone.`)) {
              result = await deleteCompany(company.id);
              successMessage = "Company deleted successfully";
            } else {
              return;
            }
            break;
          default:
            toast.error("Unknown action");
            return;
        }

        if (result?.success) {
          toast.success(successMessage);
          router.refresh();
        } else {
          toast.error(result?.error || `Failed to ${action}`);
        }
      } catch (error) {
        toast.error(`Failed to ${action}`);
      }
    });
  };

  const handleChangeSubscription = async (newPlan: SubscriptionPlan) => {
    if (!pendingAction?.company) return;

    startTransition(async () => {
      try {
        const result = await changeCompanySubscription({
          companyId: pendingAction.company.id,
          plan: newPlan,
        });

        if (result.success) {
          toast.success("Subscription plan changed successfully");
          setChangeSubscriptionOpen(false);
          setPendingAction(null);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to change subscription plan");
        }
      } catch (error) {
        toast.error("Failed to change subscription plan");
      }
    });
  };

  return (
    <>
      <BusinessesTable
        companies={companies}
        onViewCompany={handleViewCompany}
      />

      <BusinessDetailDrawer
        company={detailCompany}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onCompanyAction={handleCompanyAction}
      />

      <ChangeSubscriptionModal
        open={changeSubscriptionOpen}
        onOpenChange={setChangeSubscriptionOpen}
        companyId={pendingAction?.company?.id || ""}
        currentPlan={pendingAction?.company?.subscriptionPlan || "FREE"}
        companyName={pendingAction?.company?.name || ""}
        onConfirm={handleChangeSubscription}
        isLoading={isPending}
      />
    </>
  );
}