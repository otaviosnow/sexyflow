import { User, Project } from '../models/Subscription';
import { PLANS } from '../models/Plan';

export interface PlanLimits {
  maxSubdomains: number;
  maxPagesPerSubdomain: number;
  maxPhotos: number;
  maxVideos: number;
  hasCustomDomain: boolean;
  hasAnalytics: boolean;
  supportType: 'email' | 'whatsapp' | 'phone';
  hasTemplates: boolean;
}

export interface RestrictionResult {
  allowed: boolean;
  message?: string;
  currentUsage?: number;
  limit?: number;
}

// Obter limites do plano
export function getPlanLimits(user: User): PlanLimits {
  const plan = PLANS.find(p => p.name === user.plan);
  
  if (!plan) {
    return {
      maxSubdomains: 0,
      maxPagesPerSubdomain: 0,
      maxPhotos: 0,
      maxVideos: 0,
      hasCustomDomain: false,
      hasAnalytics: false,
      supportType: 'email',
      hasTemplates: false
    };
  }

  return {
    maxSubdomains: plan.features.subdomains,
    maxPagesPerSubdomain: plan.features.pagesPerSubdomain,
    maxPhotos: plan.features.photos,
    maxVideos: plan.features.videos,
    hasCustomDomain: plan.features.customDomain,
    hasAnalytics: plan.features.analytics,
    supportType: plan.features.support,
    hasTemplates: plan.features.templates
  };
}

// Verificar se pode criar novo subdomínio
export function canCreateSubdomain(user: User): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (limits.maxSubdomains === -1) {
    return { allowed: true }; // Ilimitado
  }
  
  const currentSubdomains = user.projects.filter(p => p.domainType === 'subdomain').length;
  
  if (currentSubdomains >= limits.maxSubdomains) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${limits.maxSubdomains} subdomínio(s) do seu plano. Faça upgrade para criar mais.`,
      currentUsage: currentSubdomains,
      limit: limits.maxSubdomains
    };
  }
  
  return { allowed: true };
}

// Verificar se pode criar nova página
export function canCreatePage(user: User, projectId: string): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (limits.maxPagesPerSubdomain === -1) {
    return { allowed: true }; // Ilimitado
  }
  
  const project = user.projects.find(p => p._id === projectId);
  if (!project) {
    return { allowed: false, message: 'Projeto não encontrado' };
  }
  
  const currentPages = project.pages.length;
  
  if (currentPages >= limits.maxPagesPerSubdomain) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${limits.maxPagesPerSubdomain} página(s) por subdomínio do seu plano. Faça upgrade para criar mais.`,
      currentUsage: currentPages,
      limit: limits.maxPagesPerSubdomain
    };
  }
  
  return { allowed: true };
}

// Verificar se pode fazer upload de foto
export function canUploadPhoto(user: User, projectId: string): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (limits.maxPhotos === -1) {
    return { allowed: true }; // Ilimitado
  }
  
  const project = user.projects.find(p => p._id === projectId);
  if (!project) {
    return { allowed: false, message: 'Projeto não encontrado' };
  }
  
  if (project.photos >= limits.maxPhotos) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${limits.maxPhotos} foto(s) do seu plano. Faça upgrade para fazer mais uploads.`,
      currentUsage: project.photos,
      limit: limits.maxPhotos
    };
  }
  
  return { allowed: true };
}

// Verificar se pode fazer upload de vídeo
export function canUploadVideo(user: User, projectId: string): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (limits.maxVideos === -1) {
    return { allowed: true }; // Ilimitado
  }
  
  const project = user.projects.find(p => p._id === projectId);
  if (!project) {
    return { allowed: false, message: 'Projeto não encontrado' };
  }
  
  if (project.videos >= limits.maxVideos) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${limits.maxVideos} vídeo(s) do seu plano. Faça upgrade para fazer mais uploads.`,
      currentUsage: project.videos,
      limit: limits.maxVideos
    };
  }
  
  return { allowed: true };
}

// Verificar se pode usar domínio customizado
export function canUseCustomDomain(user: User): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (!limits.hasCustomDomain) {
    return {
      allowed: false,
      message: 'Domínio customizado não está disponível no seu plano. Faça upgrade para o plano PRO ou ENTERPRISE.'
    };
  }
  
  return { allowed: true };
}

// Verificar se pode acessar analytics
export function canAccessAnalytics(user: User): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (!limits.hasAnalytics) {
    return {
      allowed: false,
      message: 'Analytics não está disponível no seu plano. Faça upgrade para acessar.'
    };
  }
  
  return { allowed: true };
}

// Verificar se pode usar templates
export function canUseTemplates(user: User): RestrictionResult {
  const limits = getPlanLimits(user);
  
  if (!limits.hasTemplates) {
    return {
      allowed: false,
      message: 'Templates não estão disponíveis no seu plano. Faça upgrade para o plano PRO ou ENTERPRISE.'
    };
  }
  
  return { allowed: true };
}

// Obter mensagens de limitação personalizadas
export function getRestrictionMessage(restriction: RestrictionResult, planName: string): string {
  if (restriction.allowed) return '';
  
  const upgradeMessage = planName === 'STARTER' 
    ? 'Faça upgrade para o plano PRO (R$ 47,00/mês) para ter mais recursos.'
    : 'Entre em contato para conhecer o plano ENTERPRISE com recursos ilimitados.';
  
  return `${restriction.message} ${upgradeMessage}`;
}
