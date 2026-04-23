import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import type { CompanyFilters } from "@/types/super-admin/businesses.types";

interface BusinessesFiltersProps {
  filters: CompanyFilters;
  onFiltersChange: (filters: CompanyFilters) => void;
  onExport?: () => void;
}

export function BusinessesFilters({ filters, onFiltersChange, onExport }: BusinessesFiltersProps) {
  const updateFilter = (key: keyof CompanyFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Company or owner email..."
              className="pl-10"
              value={filters.q || ""}
              onChange={(e) => updateFilter("q", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Verification Status</Label>
          <Select
            value={filters.verificationStatus || "ALL"}
            onValueChange={(value) => updateFilter("verificationStatus", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="UNVERIFIED">Unverified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subscription Plan</Label>
          <Select
            value={filters.subscriptionPlan || "ALL"}
            onValueChange={(value) => updateFilter("subscriptionPlan", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Plans</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="BASIC">Basic</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Country..."
            value={filters.country || ""}
            onChange={(e) => updateFilter("country", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Active Status</Label>
          <Select
            value={filters.isActive === undefined || filters.isActive === "ALL" ? "ALL" : filters.isActive.toString()}
            onValueChange={(value) => updateFilter("isActive", value === "ALL" ? "ALL" : value === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex items-end">
          {onExport && (
            <Button variant="outline" className="w-full" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}