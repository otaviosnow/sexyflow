// Integração com Cakto para assinaturas
// Documentação: https://docs.cakto.com

interface CaktoConfig {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
}

interface CaktoPlan {
  id: string;
  name: string;
  description: string;
  amount: number; // em centavos
  interval: 'month' | 'year';
  currency: 'BRL';
}

interface CaktoSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface CaktoCustomer {
  id: string;
  name: string;
  email: string;
  document: string; // CPF
}

class CaktoService {
  private config: CaktoConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.CAKTO_API_KEY!,
      secretKey: process.env.CAKTO_SECRET_KEY!,
      environment: (process.env.CAKTO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      webhookSecret: process.env.CAKTO_WEBHOOK_SECRET
    };

    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.cakto.com' 
      : 'https://sandbox-api.cakto.com';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Cakto API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Criar cliente
  async createCustomer(customerData: {
    name: string;
    email: string;
    document: string; // CPF
  }): Promise<CaktoCustomer> {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Criar plano
  async createPlan(planData: {
    name: string;
    description: string;
    amount: number; // em centavos
    interval: 'month' | 'year';
    currency: 'BRL';
  }): Promise<CaktoPlan> {
    return this.makeRequest('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  // Criar assinatura
  async createSubscription(subscriptionData: {
    customer_id: string;
    plan_id: string;
    payment_method: {
      type: 'credit_card' | 'pix' | 'boleto';
      card?: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
        holder_name: string;
      };
    };
  }): Promise<CaktoSubscription> {
    return this.makeRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  // Buscar assinatura
  async getSubscription(subscriptionId: string): Promise<CaktoSubscription> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<CaktoSubscription> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        cancel_at_period_end: !immediately
      }),
    });
  }

  // Verificar webhook
  verifyWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret!)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  // Processar webhook
  async processWebhook(event: any) {
    switch (event.type) {
      case 'subscription.created':
        return this.handleSubscriptionCreated(event.data);
      
      case 'subscription.updated':
        return this.handleSubscriptionUpdated(event.data);
      
      case 'subscription.canceled':
        return this.handleSubscriptionCanceled(event.data);
      
      case 'payment.succeeded':
        return this.handlePaymentSucceeded(event.data);
      
      case 'payment.failed':
        return this.handlePaymentFailed(event.data);
      
      default:
        console.log('Evento não tratado:', event.type);
    }
  }

  private async handleSubscriptionCreated(subscription: CaktoSubscription) {
    // Atualizar status da assinatura no banco
    console.log('Assinatura criada:', subscription.id);
  }

  private async handleSubscriptionUpdated(subscription: CaktoSubscription) {
    // Atualizar dados da assinatura
    console.log('Assinatura atualizada:', subscription.id);
  }

  private async handleSubscriptionCanceled(subscription: CaktoSubscription) {
    // Marcar assinatura como cancelada
    console.log('Assinatura cancelada:', subscription.id);
  }

  private async handlePaymentSucceeded(payment: any) {
    // Pagamento aprovado
    console.log('Pagamento aprovado:', payment.id);
  }

  private async handlePaymentFailed(payment: any) {
    // Pagamento falhou
    console.log('Pagamento falhou:', payment.id);
  }
}

export const caktoService = new CaktoService();

// Planos pré-definidos da Cakto
// Preços em centavos (R$ * 100)
export const CAKTO_PLANS = {
  // STARTER Mensal: R$ 29,90
  'plan-starter-monthly': {
    name: 'SexyFlow Starter Mensal',
    description: 'Plano Starter mensal - 1 subdomínio, 3 páginas por subdomínio, 10 fotos, 10 vídeos',
    amount: 2990, // R$ 29,90 em centavos
    interval: 'month' as const,
    currency: 'BRL' as const,
  },
  // STARTER Anual: R$ 299,00 (10 meses com desconto de 2 meses)
  'plan-starter-yearly': {
    name: 'SexyFlow Starter Anual',
    description: 'Plano Starter anual - Economize 2 meses! 1 subdomínio, 3 páginas por subdomínio, 10 fotos, 10 vídeos',
    amount: 29900, // R$ 299,00 em centavos
    interval: 'year' as const,
    currency: 'BRL' as const,
  },
  // PRO Mensal: R$ 47,00
  'plan-pro-monthly': {
    name: 'SexyFlow Pro Mensal',
    description: 'Plano Pro mensal - 3 subdomínios, 8 páginas por subdomínio, domínio customizado, 30 fotos, 20 vídeos, templates premium',
    amount: 4700, // R$ 47,00 em centavos
    interval: 'month' as const,
    currency: 'BRL' as const,
  },
  // PRO Anual: R$ 470,00 (10 meses com desconto de 2 meses)
  'plan-pro-yearly': {
    name: 'SexyFlow Pro Anual',
    description: 'Plano Pro anual - Economize 2 meses! 3 subdomínios, 8 páginas por subdomínio, domínio customizado, 30 fotos, 20 vídeos, templates premium',
    amount: 47000, // R$ 470,00 em centavos
    interval: 'year' as const,
    currency: 'BRL' as const,
  },
};

// Helper para obter dados do plano na Cakto baseado no planId
export function getCaktoPlanData(planId: string) {
  const plan = CAKTO_PLANS[planId as keyof typeof CAKTO_PLANS];
  if (!plan) {
    throw new Error(`Plano ${planId} não encontrado na configuração da Cakto`);
  }
  return plan;
}
