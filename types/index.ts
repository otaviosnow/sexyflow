import { User, Page, Template, FileUpload, Analytics, AuditLog, PlanType, PageType, TemplateType, UserRole } from '@prisma/client';

export type { User, Page, Template, FileUpload, Analytics, AuditLog, PlanType, PageType, TemplateType, UserRole };

export interface PageContent {
  headline?: string;
  subheadline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonUrl?: string;
  facebookPixel?: string;
  customHtml?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    background?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  styles?: {
    fontSize?: {
      heading?: string;
      body?: string;
      button?: string;
    };
    spacing?: {
      padding?: string;
      margin?: string;
    };
  };
}

export interface TemplateContent extends PageContent {
  type: TemplateType;
  name: string;
  description?: string;
  defaultContent: PageContent;
}

export interface UserWithPlan extends User {
  planInfo?: {
    type: PlanType;
    pageLimit: number;
    isActive: boolean;
    expiresAt?: Date;
  };
}

export interface PageWithTemplate extends Page {
  template: Template;
  user: User;
}

export interface AnalyticsData {
  pageViews: number;
  buttonClicks: number;
  uniqueVisitors: number;
  conversionRate: number;
  timeOnPage: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPages: number;
  publishedPages: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface FileUploadData {
  file: File;
  type: 'image' | 'video';
  maxSize: number;
}

export interface DragDropItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'html';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
