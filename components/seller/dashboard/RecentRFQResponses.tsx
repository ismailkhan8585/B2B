import { FileText, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecentRFQResponse } from "@/types/seller/dashboard.types";

interface RecentRFQResponsesProps {
  responses: RecentRFQResponse[];
}

const statusColors = {
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  EXPIRED: "secondary",
} as const;

export function RecentRFQResponses({ responses }: RecentRFQResponsesProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent RFQ Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No RFQ responses yet</p>
            <p className="text-sm">Respond to RFQs to start building relationships</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent RFQ Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{response.rfqTitle}</h4>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{response.buyerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={statusColors[response.status as keyof typeof statusColors]}>
                  {response.status}
                </Badge>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
        {responses.length >= 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Responses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}