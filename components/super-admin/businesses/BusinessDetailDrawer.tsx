import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  FileText,
  MessageSquare,
  Package,
  User,
  ExternalLink,
  Download,
} from "lucide-react";
import { BusinessActionMenu } from "./BusinessActionMenu";
import { VerificationTimeline } from "./VerificationTimeline";
import type { CompanyWithOwner } from "@/types/super-admin/businesses.types";

interface BusinessDetailDrawerProps {
  company: CompanyWithOwner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyAction: (companyId: string, action: string) => void;
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

export function BusinessDetailDrawer({ company, open, onOpenChange, onCompanyAction }: BusinessDetailDrawerProps) {
  if (!company) return null;

  const handleAction = (action: string) => {
    onCompanyAction(company.id, action);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Company Details</DrawerTitle>
          <div className="flex items-center space-x-2">
            <BusinessActionMenu companyId={company.id} onAction={handleAction} />
            <DrawerClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Company Header */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logoUrl || ""} />
                <AvatarFallback>
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <p className="text-muted-foreground">{company.businessType || "Business"}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={verificationColors[company.verificationStatus]}>
                    {company.verificationStatus.replace('_', ' ')}
                  </Badge>
                  <Badge variant={subscriptionColors[company.subscriptionPlan]}>
                    {company.subscriptionPlan}
                  </Badge>
                  {!company.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(company.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="h-5 w-5 mr-2" />
                Owner Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Owner Name</Label>
                  <p className="text-sm text-muted-foreground">{company.user.name || "Unnamed"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Owner Email</Label>
                  <p className="text-sm text-muted-foreground">{company.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={company.user.status === "ACTIVE" ? "default" : "destructive"}>
                  {company.user.status.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary">
                  {company.user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {company.description && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{company.description}</p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </p>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {company.phone}
                    </p>
                  </div>
                )}
                {company.email && (
                  <div>
                    <Label className="text-sm font-medium">Company Email</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {company.email}
                    </p>
                  </div>
                )}
                {company.country && (
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.country}
                    </p>
                  </div>
                )}
                {company.city && (
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <p className="text-sm text-muted-foreground">{company.city}</p>
                  </div>
                )}
                {company.employeeCount && (
                  <div>
                    <Label className="text-sm font-medium">Employee Count</Label>
                    <p className="text-sm text-muted-foreground">{company.employeeCount}</p>
                  </div>
                )}
                {company.yearEstablished && (
                  <div>
                    <Label className="text-sm font-medium">Year Established</Label>
                    <p className="text-sm text-muted-foreground">{company.yearEstablished}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Activity Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{company._count.products}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{company._count.rfqResponses}</div>
                  <div className="text-sm text-muted-foreground">RFQ Responses</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{company.documents.length}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {company.products.filter(p => p.status === "ACTIVE").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Products</div>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            {company.products && company.products.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Recent Products ({company.products.length})
                  </h3>
                  <div className="space-y-2">
                    {company.products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {product.status} • Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Documents */}
            {company.documents && company.documents.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents ({company.documents.length})
                  </h3>
                  <div className="space-y-2">
                    {company.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {document.type} • Status: {document.status} • Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={document.status === 'approved' ? 'default' : 'secondary'}>
                            {document.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Verification Timeline */}
            <Separator />
            <VerificationTimeline companyId={company.id} />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-sm font-medium text-foreground ${className}`}>
      {children}
    </div>
  );
}