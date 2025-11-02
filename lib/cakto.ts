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

  // Criar link de checkout para pagamento
  async createCheckoutLink(checkoutData: {
    planId: string;
    planName: string;
    amount: number; // em centavos
    interval: 'month' | 'year';
    customer: {
      name: string;
      email: string;
      document: string; // CPF
    };
    metadata: {
      userId: string;
      planId: string;
      realPlanName: string;
      billingCycle: string;
    };
  }): Promise<{ checkoutUrl: string; paymentId: string }> {
    const checkoutPayload = {
      amount: checkoutData.amount,
      currency: 'BRL',
      description: `Assinatura ${checkoutData.planName} - SexyFlow`,
      customer: checkoutData.customer,
      metadata: checkoutData.metadata,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sexyflow.onrender.com'}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sexyflow.onrender.com'}/payment/cancel`,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sexyflow.onrender.com'}/api/webhooks/cakto`,
      // Para assinaturas recorrentes
      recurring: checkoutData.interval === 'month' || checkoutData.interval === 'year',
      interval: checkoutData.interval,
    };

    // A Cakto pode ter um endpoint específico para checkout ou usar o mesmo endpoint de pagamentos
    // Ajuste conforme a documentação da Cakto
    const response = await this.makeRequest('/checkouts', {
      method: 'POST',
      body: JSON.stringify(checkoutPayload),
    });

    return {
      checkoutUrl: response.checkout_url || response.url || response.payment_url,
      paymentId: response.id || response.payment_id || response.checkout_id,
    };
  }

  // Criar assinatura (método alternativo se a Cakto suportar criar assinatura diretamente)
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

// Links de checkout da Cakto (configurados manualmente no painel da Cakto)
export const CAKTO_CHECKOUT_LINKS = {
  'plan-starter-monthly': process.env.CAKTO_CHECKOUT_STARTER_MONTHLY || 'https://pay.cakto.com.br/wceycj4',
  'plan-starter-yearly': process.env.CAKTO_CHECKOUT_STARTER_YEARLY || 'https://pay.cakto.com.br/34h9um7',
  'plan-pro-monthly': process.env.CAKTO_CHECKOUT_PRO_MONTHLY || 'https://pay.cakto.com.br/3c62vfj',
  'plan-pro-yearly': process.env.CAKTO_CHECKOUT_PRO_YEARLY || 'https://pay.cakto.com.br/366psux',
};

// Mapeamento de valores/preços para identificar o plano no webhook
// A Cakto envia o valor em REAIS (não centavos)
// Aceita valores como números (5, 25, 29.90) ou strings ("5.00", "29.90")
export const CAKTO_PRICE_TO_PLAN: Record<string, string> = {
  '29.90': 'plan-starter-monthly',
  '29,90': 'plan-starter-monthly',
  '29.9': 'plan-starter-monthly',
  '299.00': 'plan-starter-yearly',
  '299,00': 'plan-starter-yearly',
  '299': 'plan-starter-yearly',
  '47.00': 'plan-pro-monthly',
  '47,00': 'plan-pro-monthly',
  '47': 'plan-pro-monthly',
  '470.00': 'plan-pro-yearly',
  '470,00': 'plan-pro-yearly',
  '470': 'plan-pro-yearly',
};

// Mapeamento alternativo por nome do produto/checkout (se a Cakto enviar)
export const CAKTO_PRODUCT_NAME_TO_PLAN: Record<string, string> = {
  'sexyflow starter mensal': 'plan-starter-monthly',
  'sexyflow starter anual': 'plan-starter-yearly',
  'sexyflow pro mensal': 'plan-pro-monthly',
  'sexyflow pro anual': 'plan-pro-yearly',
  'starter mensal': 'plan-starter-monthly',
  'starter anual': 'plan-starter-yearly',
  'pro mensal': 'plan-pro-monthly',
  'pro anual': 'plan-pro-yearly',
};

// Planos pré-definidos da Cakto (para referência - não usado se tiver links de checkout)
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
    description: 'Plano Pro mensal - 3 subdomínios, 8 páginas por subdomínio, domínio customizado, 30 fotos, 30 vídeos, templates premium',
    amount: 4700, // R$ 47,00 em centavos
    interval: 'month' as const,
    currency: 'BRL' as const,
  },
  // PRO Anual: R$ 470,00 (10 meses com desconto de 2 meses)
  'plan-pro-yearly': {
    name: 'SexyFlow Pro Anual',
    description: 'Plano Pro anual - Economize 2 meses! 3 subdomínios, 8 páginas por subdomínio, domínio customizado, 30 fotos, 30 vídeos, templates premium',
    amount: 47000, // R$ 470,00 em centavos
    interval: 'year' as const,
    currency: 'BRL' as const,
  },
};

// Helper para obter link de checkout baseado no planId
export function getCaktoCheckoutLink(planId: string, userId: string): string {
  const link = CAKTO_CHECKOUT_LINKS[planId as keyof typeof CAKTO_CHECKOUT_LINKS];
  if (!link) {
    throw new Error(`Link de checkout não configurado para o plano ${planId}. Configure as variáveis de ambiente CAKTO_CHECKOUT_* ou adicione o link em lib/cakto.ts`);
  }
  
  // Retornar link simples - identificação será feita via valor/nome no webhook
  return link;
}

// Helper para normalizar valor de preço (aceita número ou string)
function normalizePrice(value: any): string {
  if (value === null || value === undefined) return '';
  // Converter para string e normalizar vírgula/ponto
  let str = String(value).trim().replace(',', '.');
  // Remover zeros desnecessários no final (29.90 -> 29.9, mas manter 29.00 -> 29)
  const parts = str.split('.');
  if (parts.length === 2 && parts[1] === '00') {
    str = parts[0];
  }
  return str;
}

// Helper para identificar planId a partir dos dados do webhook da Cakto
export function identifyPlanFromWebhook(webhookData: any): string | null {
  // A Cakto envia valores em REAIS (não centavos):
  // - data.offer.price (número: 29.90, 299, etc)
  // - data.subscription.amount (string: "29.90", "299.00")
  // - data.amount ou data.baseAmount (número)
  
  // 1. Tentar pelo offer.price (valor numérico em reais) - PRIORIDADE
  const offerPrice = webhookData.offer?.price;
  if (offerPrice !== undefined && offerPrice !== null) {
    const normalizedPrice = normalizePrice(offerPrice);
    const planId = CAKTO_PRICE_TO_PLAN[normalizedPrice];
    if (planId) {
      console.log(`✅ Plano identificado pelo offer.price: ${offerPrice} (${normalizedPrice}) -> ${planId}`);
      return planId;
    }
  }

  // 2. Tentar pelo subscription.amount (string em reais, ex: "29.90")
  const subscriptionAmount = webhookData.subscription?.amount;
  if (subscriptionAmount) {
    const normalizedPrice = normalizePrice(subscriptionAmount);
    const planId = CAKTO_PRICE_TO_PLAN[normalizedPrice];
    if (planId) {
      console.log(`✅ Plano identificado pelo subscription.amount: ${subscriptionAmount} (${normalizedPrice}) -> ${planId}`);
      return planId;
    }
  }

  // 3. Tentar pelo amount direto (valor do pagamento)
  const amount = webhookData.amount || webhookData.baseAmount;
  if (amount !== undefined && amount !== null) {
    const normalizedPrice = normalizePrice(amount);
    const planId = CAKTO_PRICE_TO_PLAN[normalizedPrice];
    if (planId) {
      console.log(`✅ Plano identificado pelo amount: ${amount} (${normalizedPrice}) -> ${planId}`);
      return planId;
    }
  }

  // 4. Tentar identificar pelo nome do produto/offer (fallback)
  const offerName = (webhookData.offer?.name || '').toLowerCase();
  const productName = (webhookData.product?.name || '').toLowerCase();
  const searchName = offerName || productName;
  
  if (searchName) {
    for (const [key, planId] of Object.entries(CAKTO_PRODUCT_NAME_TO_PLAN)) {
      if (searchName.includes(key)) {
        console.log(`✅ Plano identificado pelo nome: ${searchName} -> ${planId}`);
        return planId;
      }
    }
  }

  console.error('❌ Não foi possível identificar o plano do webhook');
  console.log('📋 Dados disponíveis:', {
    offer_price: webhookData.offer?.price,
    subscription_amount: webhookData.subscription?.amount,
    amount: webhookData.amount,
    baseAmount: webhookData.baseAmount,
    offer_name: webhookData.offer?.name,
    product_name: webhookData.product?.name
  });
  return null;
}

// Helper para obter dados do plano na Cakto baseado no planId (método alternativo via API)
export function getCaktoPlanData(planId: string) {
  const plan = CAKTO_PLANS[planId as keyof typeof CAKTO_PLANS];
  if (!plan) {
    throw new Error(`Plano ${planId} não encontrado na configuração da Cakto`);
  }
  return plan;
}
