export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  planName: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  paymentId?: string; // ID do pagamento na Cakto
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: 'BRL';
  gracePeriodDays: number; // Dias de tolerância após vencimento
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  age: number;
  acceptedTerms: boolean;
  acceptedTermsDate: Date;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE' | null;
  subscription?: Subscription;
  projects: Project[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  subdomain?: string; // Para subdomínios do SexyFlow
  customDomain?: string; // Para domínios próprios
  domainType: 'subdomain' | 'custom';
  pages: Page[];
  photos: number;
  videos: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  _id: string;
  projectId: string;
  name: string;
  slug: string; // Para URL: subdomain.sexyflow.com/slug
  templateId?: string;
  content: any; // Conteúdo da página
  isPublished: boolean;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

// Verificar se usuário tem plano ativo
export function hasActivePlan(user: User): boolean {
  if (!user.subscription) return false;
  
  const now = new Date();
  const endDate = new Date(user.subscription.endDate);
  const gracePeriodEnd = new Date(endDate.getTime() + (user.subscription.gracePeriodDays * 24 * 60 * 60 * 1000));
  
  return user.subscription.status === 'active' && now <= gracePeriodEnd;
}

// Verificar se está próximo do vencimento (3 dias antes)
export function isNearExpiration(user: User): boolean {
  if (!user.subscription) return false;
  
  const now = new Date();
  const endDate = new Date(user.subscription.endDate);
  const threeDaysBefore = new Date(endDate.getTime() - (3 * 24 * 60 * 60 * 1000));
  
  return now >= threeDaysBefore && now < endDate;
}

// Verificar se está em período de tolerância
export function isInGracePeriod(user: User): boolean {
  if (!user.subscription) return false;
  
  const now = new Date();
  const endDate = new Date(user.subscription.endDate);
  const gracePeriodEnd = new Date(endDate.getTime() + (user.subscription.gracePeriodDays * 24 * 60 * 60 * 1000));
  
  return now > endDate && now <= gracePeriodEnd;
}

// Calcular dias restantes
export function getDaysRemaining(user: User): number {
  if (!user.subscription) return 0;
  
  const now = new Date();
  const endDate = new Date(user.subscription.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}
