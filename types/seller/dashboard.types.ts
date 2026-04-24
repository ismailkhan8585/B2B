export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  rfqLeads: number;
  unreadMessages: number;
  profileViews: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  views: number;
  category: string;
  status: string;
}

export interface RecentRFQResponse {
  id: string;
  rfqTitle: string;
  buyerName: string;
  status: string;
  createdAt: Date;
}

export interface RecentMessage {
  id: string;
  senderName: string;
  senderRole: string;
  preview: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ActionItem {
  id: string;
  type: 'draft_products' | 'missing_documents' | 'incomplete_profile' | 'unread_responses';
  title: string;
  description: string;
  count?: number;
  actionLabel: string;
  actionLink: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardData {
  stats: DashboardStats;
  revenueData: RevenueData[];
  topProducts: TopProduct[];
  recentRFQResponses: RecentRFQResponse[];
  recentMessages: RecentMessage[];
  actionItems: ActionItem[];
}
