export interface SellerLayoutProps {
  children: React.ReactNode;
}

export interface SellerSidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface SellerNotification {
  id: string;
  title: string;
  body: string;
  type: 'rfq_response' | 'rfq_new' | 'message' | 'verification_approved' | 'verification_rejected' | 'system';
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

export interface SellerStats {
  unreadMessages: number;
  unreadNotifications: number;
  newRFQs: number;
  companyStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationMessage?: string;
}