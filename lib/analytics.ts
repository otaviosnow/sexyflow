import { prisma } from './db';
import { PageType } from '@prisma/client';

export interface AnalyticsEvent {
  pageId?: string;
  userId: string;
  event: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    await prisma.analytics.create({
      data: {
        pageId: event.pageId,
        userId: event.userId,
        event: event.event,
        metadata: event.metadata || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      }
    });
  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
  }
}

export async function getPageAnalytics(pageId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.analytics.findMany({
    where: {
      pageId: pageId,
      createdAt: {
        gte: startDate
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const pageViews = events.filter(e => e.event === 'page_view').length;
  const buttonClicks = events.filter(e => e.event === 'button_click').length;
  const uniqueVisitors = new Set(events.map(e => e.ipAddress)).size;
  
  const conversionRate = pageViews > 0 ? (buttonClicks / pageViews) * 100 : 0;

  // Calcular tempo médio na página (simulado)
  const timeOnPage = events
    .filter(e => e.event === 'page_view')
    .length * 45; // 45 segundos médios por visita

  return {
    pageViews,
    buttonClicks,
    uniqueVisitors,
    conversionRate: Math.round(conversionRate * 100) / 100,
    timeOnPage,
    events: events.slice(0, 50) // Últimos 50 eventos
  };
}

export async function getUserAnalytics(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.analytics.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: startDate
      }
    },
    include: {
      page: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalViews = events.filter(e => e.event === 'page_view').length;
  const totalClicks = events.filter(e => e.event === 'button_click').length;
  
  const pageStats = events.reduce((acc, event) => {
    if (event.pageId && event.event === 'page_view') {
      acc[event.pageId] = (acc[event.pageId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalViews,
    totalClicks,
    conversionRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
    pageStats,
    recentEvents: events.slice(0, 20)
  };
}

export async function getAdminAnalytics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalUsers, activeUsers, totalPages, publishedPages, totalEvents] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        isActive: true
      }
    }),
    prisma.page.count(),
    prisma.page.count({
      where: {
        isPublished: true
      }
    }),
    prisma.analytics.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })
  ]);

  const pageViews = await prisma.analytics.count({
    where: {
      event: 'page_view',
      createdAt: {
        gte: startDate
      }
    }
  });

  const buttonClicks = await prisma.analytics.count({
    where: {
      event: 'button_click',
      createdAt: {
        gte: startDate
      }
    }
  });

  return {
    totalUsers,
    activeUsers,
    totalPages,
    publishedPages,
    totalEvents,
    pageViews,
    buttonClicks,
    conversionRate: pageViews > 0 ? Math.round((buttonClicks / pageViews) * 10000) / 100 : 0
  };
}

export async function getPagePerformanceByType(type: PageType, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pages = await prisma.page.findMany({
    where: {
      type: type,
      isPublished: true
    },
    include: {
      analytics: {
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }
    }
  });

  const performance = pages.map(page => {
    const views = page.analytics.filter(a => a.event === 'page_view').length;
    const clicks = page.analytics.filter(a => a.event === 'button_click').length;
    
    return {
      pageId: page.id,
      title: page.title,
      views,
      clicks,
      conversionRate: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0
    };
  });

  return performance.sort((a, b) => b.views - a.views);
}
