import { Package, FileText, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/seller/dashboard.types";

interface DashboardStatsRowProps {
  stats: DashboardStats;
}

export function DashboardStatsRow({ stats }: DashboardStatsRowProps) {
  const statItems = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: `${stats.activeProducts} active`,
    },
    {
      title: "RFQ Leads",
      value: stats.rfqLeads,
      icon: FileText,
      description: "Available to respond",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      description: "Need attention",
    },
    {
      title: "Profile Views",
      value: stats.profileViews,
      icon: Eye,
      description: "Last 30 days",
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