"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  Eye,
  Check,
  X,
  User,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock data - in production this would come from the API
const pendingVerifications = [
  {
    id: "1",
    companyName: "TechCorp Industries",
    ownerName: "John Doe",
    ownerEmail: "john@techcorp.com",
    country: "USA",
    documentsCount: 4,
    submittedAt: "2024-04-15",
    waitingDays: 5,
    priority: "HIGH",
  },
  {
    id: "2",
    companyName: "Global Solutions Ltd",
    ownerName: "Jane Smith",
    ownerEmail: "jane@globalsolutions.com",
    country: "UK",
    documentsCount: 3,
    submittedAt: "2024-04-10",
    waitingDays: 10,
    priority: "MEDIUM",
  },
  {
    id: "3",
    companyName: "Innovate Corp",
    ownerName: "Bob Wilson",
    ownerEmail: "bob@innovate.com",
    country: "Canada",
    documentsCount: 2,
    submittedAt: "2024-04-05",
    waitingDays: 15,
    priority: "LOW",
  },
];

const approvedVerifications = [
  {
    id: "4",
    companyName: "Verified Solutions Inc",
    ownerName: "Alice Brown",
    ownerEmail: "alice@verified.com",
    country: "Germany",
    approvedAt: "2024-04-10",
  },
];

const rejectedVerifications = [
  {
    id: "5",
    companyName: "Fake Corp",
    ownerName: "Charlie Fake",
    ownerEmail: "charlie@fake.com",
    country: "Unknown",
    rejectedAt: "2024-04-08",
    reason: "Invalid documents",
  },
];

const priorityColors = {
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
} as const;

export default function SuperAdminVerifications() {
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleQuickApprove = (id: string) => {
    toast.success(`Verification for company ${id} approved`);
  };

  const handleQuickReject = (id: string) => {
    toast.success(`Verification for company ${id} rejected`);
  };

  const handleFullReview = (verification: any) => {
    setSelectedVerification(verification);
  };

  const handleFinalDecision = (decision: 'approve' | 'reject') => {
    if (decision === 'reject' && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    toast.success(`Verification ${decision}d for ${selectedVerification.companyName}`);
    setSelectedVerification(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verifications</h1>
          <p className="text-muted-foreground">
            Manage company verification requests and document reviews
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved ({approvedVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4 mr-2" />
            Rejected ({rejectedVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {verification.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{verification.companyName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{verification.ownerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {verification.ownerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{verification.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{verification.documentsCount}/4</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{verification.submittedAt}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{verification.waitingDays} days</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityColors[verification.priority as keyof typeof priorityColors]}>
                          {verification.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuickApprove(verification.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickReject(verification.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFullReview(verification)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Verification Review</DialogTitle>
                                <DialogDescription>
                                  Review documents and make final decision for {selectedVerification?.companyName}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedVerification && (
                                <div className="space-y-6">
                                  {/* Company Info */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Company Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Company Name</Label>
                                          <p className="font-medium">{selectedVerification.companyName}</p>
                                        </div>
                                        <div>
                                          <Label>Owner</Label>
                                          <p className="font-medium">{selectedVerification.ownerName}</p>
                                        </div>
                                        <div>
                                          <Label>Email</Label>
                                          <p>{selectedVerification.ownerEmail}</p>
                                        </div>
                                        <div>
                                          <Label>Country</Label>
                                          <p>{selectedVerification.country}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Documents */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Documents ({selectedVerification.documentsCount}/4)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        {/* Mock document list */}
                                        {[
                                          { type: "Business License", status: "pending", hasPreview: true },
                                          { type: "Tax Certificate", status: "pending", hasPreview: true },
                                          { type: "Company Registration", status: "approved", hasPreview: true },
                                          { type: "Address Proof", status: "rejected", hasPreview: false },
                                        ].map((doc, index) => (
                                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                              <FileText className="h-5 w-5 text-muted-foreground" />
                                              <div>
                                                <p className="font-medium">{doc.type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                  {doc.hasPreview ? "Preview available" : "No preview"}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Badge variant={
                                                doc.status === "approved" ? "default" :
                                                doc.status === "rejected" ? "destructive" : "secondary"
                                              }>
                                                {doc.status}
                                              </Badge>
                                              <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Final Decision */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Final Decision</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          onClick={() => handleFinalDecision('approve')}
                                          className="flex-1"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve Verification
                                        </Button>
                                        <Button
                                          onClick={() => handleFinalDecision('reject')}
                                          variant="destructive"
                                          className="flex-1"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject Verification
                                        </Button>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="rejection-reason">Rejection Reason (required for rejection)</Label>
                                        <Textarea
                                          id="rejection-reason"
                                          placeholder="Provide detailed reason for rejection..."
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {verification.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{verification.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{verification.ownerName}</TableCell>
                      <TableCell>{verification.country}</TableCell>
                      <TableCell>{verification.approvedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {verification.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{verification.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{verification.ownerName}</TableCell>
                      <TableCell>{verification.country}</TableCell>
                      <TableCell>{verification.rejectedAt}</TableCell>
                      <TableCell>{verification.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}