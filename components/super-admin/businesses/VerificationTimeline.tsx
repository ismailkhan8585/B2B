import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Mock timeline data - in a real app, this would come from audit logs
const mockTimelineData = [
  {
    id: "1",
    status: "UNVERIFIED",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    actor: "System",
    note: "Company registration completed",
  },
  {
    id: "2",
    status: "PENDING",
    timestamp: new Date("2024-01-16T14:30:00Z"),
    actor: "John Doe",
    note: "Verification documents submitted",
  },
  {
    id: "3",
    status: "PENDING",
    timestamp: new Date("2024-01-20T09:15:00Z"),
    actor: "Jane Smith",
    note: "Additional information requested",
  },
];

interface VerificationTimelineProps {
  companyId: string;
}

const statusIcons = {
  UNVERIFIED: AlertCircle,
  PENDING: Clock,
  VERIFIED: CheckCircle,
  REJECTED: XCircle,
};

const statusColors = {
  UNVERIFIED: "secondary",
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

export function VerificationTimeline({ companyId }: VerificationTimelineProps) {
  // In a real app, fetch timeline data from audit logs filtered by companyId
  const timelineData = mockTimelineData;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Clock className="h-5 w-5 mr-2" />
        Verification Timeline
      </h3>

      {timelineData.length === 0 ? (
        <p className="text-muted-foreground">No verification history available</p>
      ) : (
        <div className="space-y-4">
          {timelineData.map((event, index) => {
            const Icon = statusIcons[event.status as keyof typeof statusIcons];
            return (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${
                    event.status === 'VERIFIED' ? 'bg-green-100' :
                    event.status === 'REJECTED' ? 'bg-red-100' :
                    event.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      event.status === 'VERIFIED' ? 'text-green-600' :
                      event.status === 'REJECTED' ? 'text-red-600' :
                      event.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  {index < timelineData.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={statusColors[event.status as keyof typeof statusColors]}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      by {event.actor}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {event.note}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}