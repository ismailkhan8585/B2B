import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  MoreHorizontal,
  User,
  Package,
} from "lucide-react";
import type { CompanyWithOwner } from "@/types/super-admin/businesses.types";

interface BusinessesTableProps {
  companies: CompanyWithOwner[];
  onViewCompany: (companyId: string) => void;
}

const verificationColors = {
  UNVERIFIED: "secondary",
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

const subscriptionColors = {
  FREE: "secondary",
  BASIC: "default",
  PREMIUM: "destructive",
  ENTERPRISE: "destructive",
} as const;

export function BusinessesTable({ companies, onViewCompany }: BusinessesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No companies found
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={company.logoUrl || ""} />
                      <AvatarFallback>
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.businessType || "Business"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
                        {company.user.name || "Unnamed"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {company.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {company.country ? (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.country}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={verificationColors[company.verificationStatus]}>
                    {company.verificationStatus.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={subscriptionColors[company.subscriptionPlan]}>
                    {company.subscriptionPlan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company._count.products}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCompany(company.id)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}