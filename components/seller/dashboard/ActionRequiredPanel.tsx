import { AlertTriangle, FileText, User, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import type { ActionItem } from "@/types/seller/dashboard.types";

interface ActionRequiredPanelProps {
  actionItems: ActionItem[];
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
} as const;

const priorityIcons = {
  high: AlertTriangle,
  medium: AlertTriangle,
  low: FileText,
} as const;

export function ActionRequiredPanel({ actionItems }: ActionRequiredPanelProps) {
  const router = useRouter();

  if (actionItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="font-medium mb-2">All Set!</h3>
            <p className="text-sm text-gray-600">No actions required at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>Action Required</span>
          <Badge variant="secondary">{actionItems.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actionItems.map((item) => {
            const PriorityIcon = priorityIcons[item.priority];
            return (
              <div
                key={item.id}
                className={`flex items-start space-x-4 p-4 border rounded-lg ${priorityColors[item.priority]}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <PriorityIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                  <Button
                    size="sm"
                    onClick={() => router.push(item.actionLink)}
                    className="flex items-center space-x-2"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                {item.count && (
                  <div className="flex-shrink-0">
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}