import { FileText, MessageSquare, Users, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsRowProps {
  stats: {
    myRFQs: number;
    responsesReceived: number;
    savedSuppliers: number;
    messages: number;
  };
}

export function DashboardStatsRow({ stats }: DashboardStatsRowProps) {
  const statItems = [
    {
      title: "My RFQs",
      value: stats.myRFQs,
      icon: FileText,
      description: "Active RFQ leads",
    },
    {
      title: "Responses Received",
      value: stats.responsesReceived,
      icon: Send,
      description: "Buyer replies received",
    },
    {
      title: "Saved Suppliers",
      value: stats.savedSuppliers,
      icon: Users,
      description: "On your watchlist",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: MessageSquare,
      description: "Inbox conversations",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}