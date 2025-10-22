import { PLANS } from '../models/Plan';
import { User, Subscription } from '../models/Subscription';

export interface PaymentRequest {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface CaktoPaymentData {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  metadata: {
    userId: string;
    planId: string;
    planName: string;
  };
  webhookUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

// Configurações da Cakto
const CAKTO_API_URL = 'https://script.google.com/macros/s/AKfycbw0B_-gTxGTYw9fzWJNJip3skwg4lXm-HWtoXHuwItXU0IvRbr1Ic9xmkS0PPKRtWtwew/exec';
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/cakto`;

export class PaymentService {
  // Criar pagamento na Cakto
  static async createPayment(user: User, planId: string): Promise<PaymentResponse> {
    try {
      const plan = PLANS.find(p => p._id === planId);
      if (!plan) {
        return { success: false, error: 'Plano não encontrado' };
      }

      // Dados do pagamento para a Cakto
      const paymentData: CaktoPaymentData = {
        amount: plan.price,
        currency: 'BRL',
        description: `Assinatura ${plan.displayName} - SexyFlow`,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf
        },
        metadata: {
          userId: user._id,
          planId: plan._id,
          planName: plan.name
        },
        webhookUrl: WEBHOOK_URL,
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`
      };

      console.log('💳 Criando pagamento na Cakto:', paymentData);

      // Simular chamada para API da Cakto
      // Em produção, fazer requisição real
      const mockResponse = {
        success: true,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentUrl: `${CAKTO_API_URL}?amount=${plan.price}&description=${encodeURIComponent(paymentData.description)}&customer=${encodeURIComponent(JSON.stringify(paymentData.customer))}&metadata=${encodeURIComponent(JSON.stringify(paymentData.metadata))}`
      };

      // Salvar dados do pagamento pendente
      const pendingPayment = {
        paymentId: mockResponse.paymentId,
        userId: user._id,
        planId: plan._id,
        amount: plan.price,
        currency: 'BRL',
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentUrl: mockResponse.paymentUrl
      };

      // Salvar no localStorage (em produção, salvar no banco)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pending_payment_${user._id}`, JSON.stringify(pendingPayment));
      }

      return {
        success: true,
        paymentUrl: mockResponse.paymentUrl,
        paymentId: mockResponse.paymentId
      };

    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      return { success: false, error: 'Erro ao processar pagamento' };
    }
  }

  // Verificar status do pagamento
  static async checkPaymentStatus(paymentId: string): Promise<{ status: string; subscription?: Subscription }> {
    try {
      // Em desenvolvimento, verificar localStorage
      if (typeof window !== 'undefined') {
        const subscriptionData = localStorage.getItem(`subscription_${paymentId}`);
        if (subscriptionData) {
          const subscription = JSON.parse(subscriptionData);
          return { status: subscription.status, subscription };
        }
      }

      return { status: 'pending' };
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error);
      return { status: 'error' };
    }
  }

  // Processar renovação de assinatura
  static async processRenewal(userId: string, planId: string): Promise<PaymentResponse> {
    try {
      const plan = PLANS.find(p => p._id === planId);
      if (!plan) {
        return { success: false, error: 'Plano não encontrado' };
      }

      // Buscar dados do usuário
      const userData = localStorage.getItem(`user_${userId}`);
      if (!userData) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const user: User = JSON.parse(userData);

      // Criar novo pagamento para renovação
      return await this.createPayment(user, planId);

    } catch (error) {
      console.error('❌ Erro ao processar renovação:', error);
      return { success: false, error: 'Erro ao processar renovação' };
    }
  }


  // Verificar se usuário tem pagamento pendente
  static hasPendingPayment(userId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const pendingPayment = localStorage.getItem(`pending_payment_${userId}`);
    return !!pendingPayment;
  }

  // Obter URL de pagamento pendente
  static getPendingPaymentUrl(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const pendingPayment = localStorage.getItem(`pending_payment_${userId}`);
    if (pendingPayment) {
      const payment = JSON.parse(pendingPayment);
      return payment.paymentUrl;
    }
    
    return null;
  }

  // Limpar pagamento pendente
  static clearPendingPayment(userId: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(`pending_payment_${userId}`);
  }

  // Cancelar assinatura
  static async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Atualizar status da assinatura
      const subscriptionData = {
        userId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };

      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscriptionData));
      }

      console.log('🚫 Assinatura cancelada para usuário:', userId);

      return { success: true, message: 'Assinatura cancelada com sucesso' };

    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
      return { success: false, message: 'Erro ao cancelar assinatura' };
    }
  }
}
