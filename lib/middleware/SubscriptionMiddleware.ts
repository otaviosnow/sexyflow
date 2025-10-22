import { User } from '../models/Subscription';
import { hasActivePlan, isNearExpiration, isInGracePeriod } from '../models/Subscription';
import { generateUserNotifications } from '../utils/Notifications';

export interface SubscriptionCheck {
  hasActiveSubscription: boolean;
  isNearExpiration: boolean;
  isInGracePeriod: boolean;
  notifications: any[];
  shouldRedirect: boolean;
  redirectUrl?: string;
}

// Verificar status da assinatura do usuário
export function checkUserSubscription(user: User): SubscriptionCheck {
  const hasActiveSubscription = hasActivePlan(user);
  const isNearExpiration = isNearExpiration(user);
  const isInGracePeriod = isInGracePeriod(user);
  
  // Gerar notificações baseadas no status
  const notifications = generateUserNotifications(user);
  
  // Determinar se deve redirecionar
  let shouldRedirect = false;
  let redirectUrl: string | undefined;
  
  if (!hasActiveSubscription) {
    shouldRedirect = true;
    redirectUrl = '/plans';
  } else if (isInGracePeriod) {
    shouldRedirect = true;
    redirectUrl = '/billing';
  }
  
  return {
    hasActiveSubscription,
    isNearExpiration,
    isInGracePeriod,
    notifications,
    shouldRedirect,
    redirectUrl
  };
}

// Middleware para verificar assinatura em rotas protegidas
export function requireActiveSubscription(user: User): boolean {
  const subscriptionCheck = checkUserSubscription(user);
  return subscriptionCheck.hasActiveSubscription && !subscriptionCheck.isInGracePeriod;
}

// Middleware para verificar se usuário pode acessar recursos premium
export function requirePremiumFeature(user: User, feature: string): boolean {
  const subscriptionCheck = checkUserSubscription(user);
  
  if (!subscriptionCheck.hasActiveSubscription) {
    return false;
  }
  
  // Verificar se o plano suporta a funcionalidade
  switch (feature) {
    case 'custom-domain':
      return user.plan === 'PRO' || user.plan === 'ENTERPRISE';
    case 'templates':
      return user.plan === 'PRO' || user.plan === 'ENTERPRISE';
    case 'analytics':
      return true; // Todos os planos têm analytics
    case 'unlimited-pages':
      return user.plan === 'ENTERPRISE';
    case 'unlimited-media':
      return user.plan === 'ENTERPRISE';
    default:
      return false;
  }
}

// Obter mensagem de erro para funcionalidade não disponível
export function getFeatureErrorMessage(feature: string, currentPlan: string): string {
  switch (feature) {
    case 'custom-domain':
      return 'Domínio customizado está disponível apenas no plano PRO ou ENTERPRISE. Faça upgrade para usar.';
    case 'templates':
      return 'Templates premium estão disponíveis apenas no plano PRO ou ENTERPRISE. Faça upgrade para acessar.';
    case 'unlimited-pages':
      return 'Páginas ilimitadas estão disponíveis apenas no plano ENTERPRISE. Entre em contato para conhecer.';
    case 'unlimited-media':
      return 'Mídia ilimitada está disponível apenas no plano ENTERPRISE. Entre em contato para conhecer.';
    default:
      return 'Esta funcionalidade não está disponível no seu plano atual.';
  }
}

// Verificar se usuário pode criar novo projeto
export function canCreateProject(user: User): { allowed: boolean; message?: string } {
  const subscriptionCheck = checkUserSubscription(user);
  
  if (!subscriptionCheck.hasActiveSubscription) {
    return {
      allowed: false,
      message: 'Você precisa de uma assinatura ativa para criar projetos.'
    };
  }
  
  if (subscriptionCheck.isInGracePeriod) {
    return {
      allowed: false,
      message: 'Sua assinatura está em período de tolerância. Renove para criar novos projetos.'
    };
  }
  
  // Verificar limite de projetos baseado no plano
  const currentProjects = user.projects?.length || 0;
  const maxProjects = user.plan === 'STARTER' ? 1 : user.plan === 'PRO' ? 3 : -1; // -1 = ilimitado
  
  if (maxProjects !== -1 && currentProjects >= maxProjects) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${maxProjects} projeto(s) do seu plano. Faça upgrade para criar mais.`
    };
  }
  
  return { allowed: true };
}

// Verificar se usuário pode acessar dashboard
export function canAccessDashboard(user: User): { allowed: boolean; redirectUrl?: string } {
  const subscriptionCheck = checkUserSubscription(user);
  
  if (!subscriptionCheck.hasActiveSubscription) {
    return {
      allowed: false,
      redirectUrl: '/plans'
    };
  }
  
  if (subscriptionCheck.isInGracePeriod) {
    return {
      allowed: false,
      redirectUrl: '/billing'
    };
  }
  
  return { allowed: true };
}
