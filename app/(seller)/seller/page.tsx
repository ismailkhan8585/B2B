"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DashboardStatsRow } from "@/components/seller/dashboard/DashboardStatsRow";
import { RevenueTrendChart } from "@/components/seller/dashboard/RevenueTrendChart";
import { TopProductsTable } from "@/components/seller/dashboard/TopProductsTable";
import { RecentRFQResponses } from "@/components/seller/dashboard/RecentRFQResponses";
import { RecentMessages } from "@/components/seller/dashboard/RecentMessages";
import { ActionRequiredPanel } from "@/components/seller/dashboard/ActionRequiredPanel";
import { getDashboardData } from "@/actions/seller/dashboard.actions";
import type { DashboardData } from "@/types/seller/dashboard.types";

export default function SellerDashboard() {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData(period);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for other sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your business overview.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error || 'Something went wrong while loading your dashboard data.'}
                </p>
                <Button onClick={loadDashboardData}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <Select value={period} onValueChange={(value: '7' | '30' | '90') => setPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <DashboardStatsRow stats={data.stats} />

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart data={data.revenueData} period={period} />
        <TopProductsTable products={data.topProducts} />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRFQResponses responses={data.recentRFQResponses} />
        <RecentMessages messages={data.recentMessages} />
      </div>

      {/* Action Required */}
      <ActionRequiredPanel actionItems={data.actionItems} />
    </div>
  );
}