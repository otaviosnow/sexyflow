import { User } from '../models/Subscription';
import { hasActivePlan, isNearExpiration, isInGracePeriod, getDaysRemaining } from '../models/Subscription';

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  dismissible: boolean;
  autoHide?: number; // segundos para auto-ocultar
  createdAt: Date;
}

// Gerar notificações baseadas no status do usuário
export function generateUserNotifications(user: User): Notification[] {
  const notifications: Notification[] = [];
  
  // Verificar se usuário não tem plano ativo
  if (!hasActivePlan(user)) {
    notifications.push({
      id: 'no-active-plan',
      type: 'error',
      title: 'Plano Necessário',
      message: 'Você precisa escolher um plano para acessar o sistema. Escolha entre STARTER (R$ 29,90/mês) ou PRO (R$ 47,00/mês).',
      action: {
        label: 'Escolher Plano',
        url: '/plans'
      },
      dismissible: false,
      createdAt: new Date()
    });
    return notifications;
  }
  
  // Verificar se está próximo do vencimento (3 dias antes)
  if (isNearExpiration(user)) {
    const daysRemaining = getDaysRemaining(user);
    notifications.push({
      id: 'subscription-expiring',
      type: 'warning',
      title: 'Assinatura Vencendo',
      message: `Sua assinatura vence em ${daysRemaining} dia(s). Renove para continuar usando o sistema sem interrupções.`,
      action: {
        label: 'Renovar Agora',
        url: '/billing'
      },
      dismissible: true,
      autoHide: 10,
      createdAt: new Date()
    });
  }
  
  // Verificar se está em período de tolerância
  if (isInGracePeriod(user)) {
    notifications.push({
      id: 'grace-period',
      type: 'error',
      title: 'Período de Tolerância',
      message: 'Sua assinatura venceu! Você tem 2 dias para renovar ou suas páginas serão desativadas e domínios desconectados.',
      action: {
        label: 'Renovar Urgente',
        url: '/billing'
      },
      dismissible: false,
      createdAt: new Date()
    });
  }
  
  return notifications;
}

// Notificações específicas para limitações de plano
export function generatePlanLimitNotifications(user: User, restrictionType: string): Notification[] {
  const notifications: Notification[] = [];
  
  switch (restrictionType) {
    case 'subdomain-limit':
      notifications.push({
        id: 'subdomain-limit',
        type: 'warning',
        title: 'Limite de Subdomínios',
        message: 'Você atingiu o limite de subdomínios do seu plano. Faça upgrade para criar mais.',
        action: {
          label: 'Fazer Upgrade',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 8,
        createdAt: new Date()
      });
      break;
      
    case 'page-limit':
      notifications.push({
        id: 'page-limit',
        type: 'warning',
        title: 'Limite de Páginas',
        message: 'Você atingiu o limite de páginas por subdomínio do seu plano. Faça upgrade para criar mais.',
        action: {
          label: 'Fazer Upgrade',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 8,
        createdAt: new Date()
      });
      break;
      
    case 'photo-limit':
      notifications.push({
        id: 'photo-limit',
        type: 'warning',
        title: 'Limite de Fotos',
        message: 'Você atingiu o limite de fotos do seu plano. Faça upgrade para fazer mais uploads.',
        action: {
          label: 'Fazer Upgrade',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 8,
        createdAt: new Date()
      });
      break;
      
    case 'video-limit':
      notifications.push({
        id: 'video-limit',
        type: 'warning',
        title: 'Limite de Vídeos',
        message: 'Você atingiu o limite de vídeos do seu plano. Faça upgrade para fazer mais uploads.',
        action: {
          label: 'Fazer Upgrade',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 8,
        createdAt: new Date()
      });
      break;
      
    case 'custom-domain-not-available':
      notifications.push({
        id: 'custom-domain-not-available',
        type: 'info',
        title: 'Domínio Customizado',
        message: 'Domínio customizado está disponível apenas no plano PRO ou ENTERPRISE. Faça upgrade para usar.',
        action: {
          label: 'Ver Planos',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 10,
        createdAt: new Date()
      });
      break;
      
    case 'templates-not-available':
      notifications.push({
        id: 'templates-not-available',
        type: 'info',
        title: 'Templates Premium',
        message: 'Templates premium estão disponíveis apenas no plano PRO ou ENTERPRISE. Faça upgrade para acessar.',
        action: {
          label: 'Ver Planos',
          url: '/plans'
        },
        dismissible: true,
        autoHide: 10,
        createdAt: new Date()
      });
      break;
  }
  
  return notifications;
}

// Notificações de sucesso
export function generateSuccessNotifications(action: string): Notification[] {
  const notifications: Notification[] = [];
  
  switch (action) {
    case 'subscription-created':
      notifications.push({
        id: 'subscription-created',
        type: 'success',
        title: 'Assinatura Ativada!',
        message: 'Sua assinatura foi ativada com sucesso. Agora você pode acessar todos os recursos do seu plano.',
        dismissible: true,
        autoHide: 5,
        createdAt: new Date()
      });
      break;
      
    case 'payment-success':
      notifications.push({
        id: 'payment-success',
        type: 'success',
        title: 'Pagamento Aprovado!',
        message: 'Seu pagamento foi processado com sucesso. Sua assinatura foi renovada.',
        dismissible: true,
        autoHide: 5,
        createdAt: new Date()
      });
      break;
      
    case 'upgrade-success':
      notifications.push({
        id: 'upgrade-success',
        type: 'success',
        title: 'Upgrade Realizado!',
        message: 'Seu plano foi atualizado com sucesso. Novos recursos já estão disponíveis.',
        dismissible: true,
        autoHide: 5,
        createdAt: new Date()
      });
      break;
  }
  
  return notifications;
}

// Sistema de notificações push (simulado)
export class NotificationService {
  private static notifications: Notification[] = [];
  
  static add(notification: Notification): void {
    this.notifications.push(notification);
  }
  
  static remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
  
  static getAll(): Notification[] {
    return this.notifications;
  }
  
  static clear(): void {
    this.notifications = [];
  }
  
  static getByType(type: string): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }
}
