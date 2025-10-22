import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Configurações da Cakto
const CAKTO_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw0B_-gTxGTYw9fzWJNJip3skwg4lXm-HWtoXHuwItXU0IvRbr1Ic9xmkS0PPKRtWtwew/exec';
const CAKTO_WEBHOOK_SECRET = '0082bb51-0cf7-4b49-8f69-11400a59b6e3';

// Tipos de eventos da Cakto
interface CaktoWebhookEvent {
  event: 'payment.approved' | 'payment.failed' | 'payment.refunded' | 'subscription.created' | 'subscription.cancelled';
  data: {
    paymentId: string;
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    createdAt: string;
    updatedAt: string;
    metadata?: {
      subscriptionId?: string;
      billingCycle?: string;
      nextBillingDate?: string;
    };
  };
}

// Verificar assinatura do webhook
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', CAKTO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Processar evento de pagamento aprovado
async function handlePaymentApproved(event: CaktoWebhookEvent) {
  console.log('💰 Pagamento aprovado:', event.data);
  
  try {
    // Atualizar status da assinatura no banco de dados
    // Em desenvolvimento, usar localStorage
    const subscriptionData = {
      userId: event.data.userId,
      planId: event.data.planId,
      paymentId: event.data.paymentId,
      status: 'active',
      amount: event.data.amount,
      currency: event.data.currency,
      paidAt: new Date().toISOString(),
      nextBillingDate: event.data.metadata?.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Salvar no localStorage (em produção, salvar no banco)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`subscription_${event.data.userId}`, JSON.stringify(subscriptionData));
    }
    
    // Enviar notificação de sucesso
    console.log('✅ Assinatura ativada para usuário:', event.data.userId);
    
    return { success: true, message: 'Pagamento processado com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

// Processar evento de pagamento falhado
async function handlePaymentFailed(event: CaktoWebhookEvent) {
  console.log('❌ Pagamento falhado:', event.data);
  
  try {
    // Atualizar status da assinatura
    const subscriptionData = {
      userId: event.data.userId,
      planId: event.data.planId,
      paymentId: event.data.paymentId,
      status: 'failed',
      amount: event.data.amount,
      currency: event.data.currency,
      failedAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`subscription_${event.data.userId}`, JSON.stringify(subscriptionData));
    }
    
    // Enviar notificação de falha
    console.log('⚠️ Pagamento falhado para usuário:', event.data.userId);
    
    return { success: true, message: 'Status de pagamento atualizado' };
  } catch (error) {
    console.error('❌ Erro ao processar pagamento falhado:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

// Processar evento de reembolso
async function handlePaymentRefunded(event: CaktoWebhookEvent) {
  console.log('🔄 Reembolso processado:', event.data);
  
  try {
    // Atualizar status da assinatura
    const subscriptionData = {
      userId: event.data.userId,
      planId: event.data.planId,
      paymentId: event.data.paymentId,
      status: 'refunded',
      amount: event.data.amount,
      currency: event.data.currency,
      refundedAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`subscription_${event.data.userId}`, JSON.stringify(subscriptionData));
    }
    
    console.log('💸 Reembolso processado para usuário:', event.data.userId);
    
    return { success: true, message: 'Reembolso processado' };
  } catch (error) {
    console.error('❌ Erro ao processar reembolso:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

// Processar evento de assinatura cancelada
async function handleSubscriptionCancelled(event: CaktoWebhookEvent) {
  console.log('🚫 Assinatura cancelada:', event.data);
  
  try {
    // Atualizar status da assinatura
    const subscriptionData = {
      userId: event.data.userId,
      planId: event.data.planId,
      paymentId: event.data.paymentId,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`subscription_${event.data.userId}`, JSON.stringify(subscriptionData));
    }
    
    console.log('🚫 Assinatura cancelada para usuário:', event.data.userId);
    
    return { success: true, message: 'Assinatura cancelada' };
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

// Endpoint principal do webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cakto-signature') || '';
    
    console.log('🔔 Webhook recebido da Cakto');
    console.log('📝 Body:', body);
    console.log('🔐 Signature:', signature);
    
    // Verificar assinatura (em desenvolvimento, pular verificação)
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(body, signature)) {
        console.error('❌ Assinatura inválida');
        return NextResponse.json(
          { error: 'Assinatura inválida' },
          { status: 401 }
        );
      }
    }
    
    // Parse do evento
    const event: CaktoWebhookEvent = JSON.parse(body);
    console.log('📊 Evento:', event.event);
    console.log('📋 Dados:', event.data);
    
    let result;
    
    // Processar evento baseado no tipo
    switch (event.event) {
      case 'payment.approved':
        result = await handlePaymentApproved(event);
        break;
        
      case 'payment.failed':
        result = await handlePaymentFailed(event);
        break;
        
      case 'payment.refunded':
        result = await handlePaymentRefunded(event);
        break;
        
      case 'subscription.created':
        result = await handlePaymentApproved(event); // Tratar como pagamento aprovado
        break;
        
      case 'subscription.cancelled':
        result = await handleSubscriptionCancelled(event);
        break;
        
      default:
        console.log('⚠️ Evento não reconhecido:', event.event);
        return NextResponse.json(
          { error: 'Evento não reconhecido' },
          { status: 400 }
        );
    }
    
    if (result.success) {
      console.log('✅ Webhook processado com sucesso');
      return NextResponse.json({ success: true, message: result.message });
    } else {
      console.error('❌ Erro ao processar webhook:', result.message);
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook da Cakto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para teste do webhook
export async function GET() {
  return NextResponse.json({
    message: 'Webhook da Cakto funcionando',
    timestamp: new Date().toISOString(),
    url: CAKTO_WEBHOOK_URL
  });
}