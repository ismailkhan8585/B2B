"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in real implementation, this would come from API calls
const statsData = {
  totalUsers: 1247,
  userGrowth: 12.5,
  activeBusinesses: 89,
  totalProducts: 2341,
  openRFQs: 56,
  gmvToday: 45280,
  revenueToday: 12840,
};

const userGrowthData = [
  { date: "2024-01", buyers: 45, sellers: 23 },
  { date: "2024-02", buyers: 52, sellers: 28 },
  { date: "2024-03", buyers: 61, sellers: 32 },
  { date: "2024-04", buyers: 58, sellers: 35 },
  { date: "2024-05", buyers: 72, sellers: 41 },
  { date: "2024-06", buyers: 89, sellers: 48 },
  { date: "2024-07", buyers: 95, sellers: 52 },
  { date: "2024-08", buyers: 108, sellers: 58 },
  { date: "2024-09", buyers: 125, sellers: 64 },
  { date: "2024-10", buyers: 142, sellers: 71 },
  { date: "2024-11", buyers: 158, sellers: 78 },
  { date: "2024-12", buyers: 175, sellers: 85 },
  { date: "2025-01", buyers: 192, sellers: 92 },
  { date: "2025-02", buyers: 210, sellers: 98 },
  { date: "2025-03", buyers: 228, sellers: 105 },
  { date: "2025-04", buyers: 245, sellers: 112 },
  { date: "2025-05", buyers: 265, sellers: 118 },
  { date: "2025-06", buyers: 285, sellers: 125 },
  { date: "2025-07", buyers: 305, sellers: 132 },
  { date: "2025-08", buyers: 328, sellers: 138 },
  { date: "2025-09", buyers: 352, sellers: 145 },
  { date: "2025-10", buyers: 375, sellers: 152 },
  { date: "2025-11", buyers: 398, sellers: 158 },
  { date: "2025-12", buyers: 422, sellers: 165 },
  { date: "2026-01", buyers: 445, sellers: 172 },
  { date: "2026-02", buyers: 470, sellers: 178 },
  { date: "2026-03", buyers: 495, sellers: 185 },
  { date: "2026-04", buyers: 520, sellers: 192 },
];

const revenueData = [
  { name: "Subscriptions", value: 4500, color: "#0088FE" },
  { name: "Transaction Fees", value: 3200, color: "#00C49F" },
  { name: "Featured Listings", value: 1800, color: "#FFBB28" },
  { name: "Premium Services", value: 950, color: "#FF8042" },
];

const rfqActivityData = [
  { date: "Mon", posted: 12, responded: 8 },
  { date: "Tue", posted: 15, responded: 11 },
  { date: "Wed", posted: 18, responded: 13 },
  { date: "Thu", posted: 14, responded: 9 },
  { date: "Fri", posted: 22, responded: 16 },
  { date: "Sat", posted: 8, responded: 5 },
  { date: "Sun", posted: 6, responded: 3 },
];

const recentUsers = [
  { id: "1", name: "Alice Johnson", role: "BUYER", timeAgo: "2 hours ago" },
  { id: "2", name: "TechCorp Inc", role: "SELLER", timeAgo: "4 hours ago" },
  { id: "3", name: "Bob Smith", role: "BUYER", timeAgo: "6 hours ago" },
  { id: "4", name: "Global Solutions Ltd", role: "SELLER", timeAgo: "8 hours ago" },
  { id: "5", name: "Carol Davis", role: "BUYER", timeAgo: "12 hours ago" },
  { id: "6", name: "Innovate Corp", role: "SELLER", timeAgo: "1 day ago" },
  { id: "7", name: "David Wilson", role: "BUYER", timeAgo: "1 day ago" },
  { id: "8", name: "Future Tech LLC", role: "SELLER", timeAgo: "2 days ago" },
  { id: "9", name: "Eva Martinez", role: "BUYER", timeAgo: "2 days ago" },
  { id: "10", name: "Smart Solutions Inc", role: "SELLER", timeAgo: "3 days ago" },
];

const systemHealth = {
  database: { status: "connected", lastBackup: "2026-04-22 02:00 UTC" },
  storage: { used: 2.4, limit: 100, status: "healthy" },
  apiResponseTime: 145, // ms
};

export default function SuperAdminOverview() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(statsData.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +{statsData.userGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(statsData.activeBusinesses)}</div>
            <p className="text-xs text-muted-foreground">Verified companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(statsData.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(statsData.openRFQs)}</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GMV Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statsData.gmvToday)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +8.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statsData.revenueToday)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +12.5% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="buyers"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Buyers"
                />
                <Line
                  type="monotone"
                  dataKey="sellers"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Sellers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* RFQ Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>RFQ Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rfqActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="posted" fill="#8884d8" name="Posted" />
              <Bar dataKey="responded" fill="#82ca9d" name="Responded" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Feeds and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Registrations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Registrations</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === "BUYER" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{user.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Verifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">12</span>
                <Button variant="outline" size="sm">
                  Resolve →
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Open Disputes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">3</span>
                <Badge variant="destructive">High</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Failed Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">2</span>
                <Button variant="outline" size="sm">
                  Review →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Cloudinary Storage</span>
              <span className="text-sm">
                {systemHealth.storage.used}GB / {systemHealth.storage.limit}GB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">API Response</span>
              <span className="text-sm">{systemHealth.apiResponseTime}ms</span>
            </div>

            <div className="space-y-1">
              <span className="text-sm">Last DB Backup</span>
              <p className="text-xs text-muted-foreground">
                {systemHealth.database.lastBackup}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}