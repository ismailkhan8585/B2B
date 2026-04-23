"use server";

export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DashboardData } from "@/types/seller/dashboard.types";

export async function getDashboardData(period: '7' | '30' | '90' = '30'): Promise<DashboardData> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SELLER") {
    throw new Error("Unauthorized: Seller access required");
  }

  const sellerId = session.user.id;
  const company = await prisma.company.findUnique({
    where: { userId: sellerId },
    select: { id: true, verificationStatus: true },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const companyId = company.id;
  const days = parseInt(period);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get stats
  const [
    totalProducts,
    activeProducts,
    rfqLeads,
    unreadMessages,
    profileViews,
  ] = await Promise.all([
    // Total products
    prisma.product.count({ where: { companyId } }),

    // Active products
    prisma.product.count({ where: { companyId, status: 'ACTIVE' } }),

    // RFQ leads (available RFQs in seller's categories)
    prisma.rFQ.count({
      where: {
        status: 'OPEN',
        isPublic: true,
        createdAt: { gte: since },
        // TODO: Filter by seller's main categories
      },
    }),

    // Unread messages
    prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: { userId: sellerId },
          },
        },
        senderId: { not: sellerId },
        isRead: false,
      },
    }),

    // Profile views (using viewCount from company)
    prisma.company.findUnique({
      where: { id: companyId },
      select: { viewCount: true },
    }).then(company => company?.viewCount || 0),
  ]);

  // Get revenue data (mock for now - would calculate from awarded RFQs)
  const revenueData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 100, // Mock data
    };
  });

  // Get top products
  const topProducts = await prisma.product.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      viewCount: true,
      category: { select: { name: true } },
      status: true,
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });

  // Get recent RFQ responses
  const recentRFQResponses = await prisma.rFQResponse.findMany({
    where: { companyId },
    select: {
      id: true,
      rfq: { select: { title: true } },
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Get recent messages
  const recentMessages = await prisma.message.findMany({
    where: {
      conversation: {
        participants: {
          some: { userId: sellerId },
        },
      },
      senderId: { not: sellerId },
    },
    select: {
      id: true,
      content: true,
      sender: { select: { name: true, role: true } },
      createdAt: true,
      isRead: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Generate action items
  const actionItems = [];

  // Check for draft products
  const draftProducts = await prisma.product.count({
    where: { companyId, status: 'DRAFT' },
  });
  if (draftProducts > 0) {
    actionItems.push({
      id: 'draft_products',
      type: 'draft_products' as const,
      title: 'Publish Draft Products',
      description: `You have ${draftProducts} product${draftProducts > 1 ? 's' : ''} in draft status`,
      count: draftProducts,
      actionLabel: 'Publish Now',
      actionLink: '/seller/products',
      priority: 'medium' as const,
    });
  }

  // Check company verification
  if (company.verificationStatus === 'UNVERIFIED') {
    actionItems.push({
      id: 'missing_documents',
      type: 'missing_documents' as const,
      title: 'Complete Verification',
      description: 'Upload required documents to get verified and unlock all features',
      actionLabel: 'Upload Documents',
      actionLink: '/seller/profile',
      priority: 'high' as const,
    });
  }

  // Check profile completeness
  const companyProfile = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      logoUrl: true,
      description: true,
      country: true,
      city: true,
      website: true,
      phone: true,
      email: true,
    },
  });

  const requiredFields = ['description', 'country', 'city', 'website', 'phone', 'email'];
  const missingFields = requiredFields.filter(field => !companyProfile?.[field as keyof typeof companyProfile]);

  if (missingFields.length > 0 || !companyProfile?.logoUrl) {
    actionItems.push({
      id: 'incomplete_profile',
      type: 'incomplete_profile' as const,
      title: 'Complete Your Profile',
      description: `${missingFields.length + (!companyProfile?.logoUrl ? 1 : 0)} field${missingFields.length + (!companyProfile?.logoUrl ? 1 : 0) > 1 ? 's' : ''} missing from your company profile`,
      actionLabel: 'Complete Profile',
      actionLink: '/seller/profile',
      priority: 'medium' as const,
    });
  }

  return {
    stats: {
      totalProducts,
      activeProducts,
      rfqLeads,
      unreadMessages,
      profileViews,
    },
    revenueData,
    topProducts: topProducts.map(product => ({
      id: product.id,
      name: product.name,
      views: product.viewCount,
      category: product.category?.name || 'Uncategorized',
      status: product.status,
    })),
    recentRFQResponses: recentRFQResponses.map(response => ({
      id: response.id,
      rfqTitle: response.rfq.title,
      buyerName: 'Buyer', // TODO: Get buyer name from RFQ
      status: response.status,
      createdAt: response.createdAt,
    })),
    recentMessages: recentMessages.map(message => ({
      id: message.id,
      senderName: message.sender.name || 'Unknown',
      senderRole: message.sender.role,
      preview: message.content?.substring(0, 50) || 'File attachment',
      timestamp: message.createdAt,
      isRead: message.isRead,
    })),
    actionItems,
  };
}