import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import { identifyPlanFromWebhook } from '@/lib/cakto';

// Configurações da Cakto
const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || '0082bb51-0cf7-4b49-8f69-11400a59b6e3';

// Tipos de eventos da Cakto
interface CaktoWebhookEvent {
  type?: string; // Formato alternativo: event.type
  event?: string; // Formato padrão: event.event
  action?: string; // Formato alternativo: event.action
  data?: any;
  offer?: any;
  subscription?: any;
  customer?: any;
  payment?: any;
  [key: string]: any; // Permitir propriedades adicionais do webhook real
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

// Função auxiliar para ativar subscription
async function activateSubscription(
  userId: string, 
  planId: string, 
  paymentId: string | null, 
  existingSubscription: any
) {
  try {
    // Extrair informações do planId
    const [_, planType, billingCycle] = planId.split('-');
    const planName = planType.toUpperCase() as 'STARTER' | 'PRO';
    const finalBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';

    // Buscar subscription pendente pelo paymentId ou userId + planId
    let subscription = existingSubscription || await Subscription.findOne({
      $or: [
        { stripeSubscriptionId: paymentId },
        { userId: userId, planId: planId, status: 'pending' }
      ]
    });

    if (subscription) {
      // Atualizar subscription existente
      subscription.status = 'active';
      if (paymentId) subscription.stripeSubscriptionId = paymentId;
      subscription.currentPeriodStart = new Date();
      
      // Calcular período final baseado no billingCycle
      subscription.currentPeriodEnd = finalBillingCycle === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 dias
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

      await subscription.save();
      console.log('✅ Subscription atualizada e ativada:', subscription._id);
    } else {
      // Criar nova subscription se não encontrada
      console.log('⚠️ Subscription não encontrada, criando nova...');
      subscription = new Subscription({
        userId: userId,
        planId: planId,
        realPlanName: planName,
        billingCycle: finalBillingCycle,
        planName: finalBillingCycle === 'yearly' ? 'yearly' : 'monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: finalBillingCycle === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: paymentId || undefined,
        cancelAtPeriodEnd: false
      });
      await subscription.save();
      console.log('✅ Nova subscription criada:', subscription._id);
    }

    // Atualizar usuário
    await User.findByIdAndUpdate(userId, {
      planType: subscription.billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY',
      planStartDate: subscription.currentPeriodStart,
      planEndDate: subscription.currentPeriodEnd
    });

    console.log('✅ Assinatura ativada para usuário:', userId);
    
    return { success: true, message: 'Pagamento processado com sucesso' };
  } catch (error: any) {
    console.error('❌ Erro ao ativar subscription:', error);
    throw error;
  }
}

// Processar evento de pagamento aprovado (purchase_approved)
async function handlePaymentApproved(event: any) {
  console.log('💰 Pagamento aprovado (purchase_approved)');
  console.log('📋 Evento completo:', JSON.stringify(event, null, 2));
  
  try {
    await connectDB();

    const eventData = event.data || event;
    
    // Extrair dados do formato real da Cakto
    const paymentId = eventData.id; // ID do pagamento
    const customerEmail = eventData.customer?.email;
    const subscriptionId = eventData.subscription?.id;
    const subscriptionStatus = eventData.subscription?.status; // "active"
    
    // Identificar o plano usando valor, nome do produto
    const planId = identifyPlanFromWebhook(eventData);
    
    if (!planId) {
      console.error('❌ Não foi possível identificar o plano do webhook');
      return { success: false, message: 'Não foi possível identificar o plano comprado' };
    }

    // Buscar usuário pelo email
    if (!customerEmail) {
      console.error('❌ Email do cliente não encontrado no webhook');
      return { success: false, message: 'Email do cliente não encontrado' };
    }

    const user = await User.findOne({ email: customerEmail });
    if (!user) {
      console.error('❌ Usuário não encontrado. Email recebido:', customerEmail);
      return { success: false, message: 'Usuário não encontrado no sistema' };
    }

    const userId = user._id.toString();
    console.log('✅ Dados identificados:', { 
      userId, 
      planId, 
      paymentId, 
      subscriptionId,
      email: customerEmail 
    });

    // Ativar subscription e salvar subscription ID da Cakto
    const result = await activateSubscription(userId, planId, paymentId, null);
    
    // Se temos subscription ID da Cakto, atualizar
    if (subscriptionId && result.success) {
      await Subscription.findOneAndUpdate(
        { userId: userId, planId: planId, status: 'active' },
        { 
          stripeSubscriptionId: subscriptionId, // Guardar ID da subscription da Cakto
          stripeCustomerId: eventData.customer?.id // Guardar customer ID se tiver
        }
      );
    }

    return result;
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de pagamento falhado/recusado (purchase_refused)
async function handlePaymentFailed(event: any) {
  console.log('❌ Pagamento recusado (purchase_refused)');
  console.log('📋 Evento:', JSON.stringify(event, null, 2));
  
  try {
    await connectDB();

    const eventData = event.data || event;
    const paymentId = eventData.id;
    const customerEmail = eventData.customer?.email;
    const subscriptionId = eventData.subscription?.id;

    // Buscar subscription pelo ID da Cakto ou pelo email do usuário
    let subscription = null;
    
    if (subscriptionId) {
      subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId
      });
    }
    
    if (!subscription && customerEmail) {
      const user = await User.findOne({ email: customerEmail });
      if (user) {
        subscription = await Subscription.findOne({
          userId: user._id,
          status: { $in: ['active', 'pending'] }
        });
      }
    }

    if (subscription) {
      subscription.status = 'unpaid';
      await subscription.save();
      console.log('⚠️ Subscription marcada como unpaid:', subscription._id);
    } else {
      console.warn('⚠️ Subscription não encontrada para marcar como unpaid. Payment ID:', paymentId);
    }

    console.log('⚠️ Pagamento recusado. Email:', customerEmail);
    
    return { success: true, message: 'Status de pagamento atualizado' };
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento falhado:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de reembolso (refund)
async function handlePaymentRefunded(event: any) {
  console.log('💸 Reembolso processado (refund)');
  console.log('📋 Evento:', JSON.stringify(event, null, 2));
  
  try {
    await connectDB();

    const eventData = event.data || event;
    const paymentId = eventData.id;
    const customerEmail = eventData.customer?.email;
    const subscriptionId = eventData.subscription?.id;

    // Buscar subscription pelo ID da Cakto ou pelo email do usuário
    let subscription = null;
    
    if (subscriptionId) {
      subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId
      });
    }
    
    if (!subscription && customerEmail) {
      const user = await User.findOne({ email: customerEmail });
      if (user) {
        subscription = await Subscription.findOne({
          userId: user._id,
          status: 'active'
        });
      }
    }

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date(eventData.refundedAt || Date.now());
      await subscription.save();
      console.log('💸 Subscription cancelada por reembolso:', subscription._id);
    } else {
      console.warn('⚠️ Subscription não encontrada para reembolso. Payment ID:', paymentId);
    }

    console.log('💸 Reembolso processado. Email:', customerEmail);
    
    return { success: true, message: 'Reembolso processado' };
  } catch (error: any) {
    console.error('❌ Erro ao processar reembolso:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de assinatura cancelada (subscription_canceled)
async function handleSubscriptionCancelled(event: any) {
  console.log('🚫 Assinatura cancelada (subscription_canceled)');
  console.log('📋 Evento:', JSON.stringify(event, null, 2));
  
  try {
    await connectDB();

    const eventData = event.data || event;
    const subscriptionId = eventData.subscription?.id;
    const customerEmail = eventData.customer?.email || eventData.subscription?.customer?.email;

    // Buscar subscription pelo ID da Cakto ou pelo email do usuário
    let subscription = null;
    
    if (subscriptionId) {
      subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId
      });
    }
    
    // Se não encontrou pelo ID, buscar pelo email do usuário
    if (!subscription && customerEmail) {
      const user = await User.findOne({ email: customerEmail });
      if (user) {
        subscription = await Subscription.findOne({
          userId: user._id,
          status: 'active'
        });
      }
    }

    if (subscription) {
      subscription.status = 'canceled';
      subscription.cancelAtPeriodEnd = true;
      subscription.canceledAt = new Date(eventData.subscription?.canceledAt || Date.now());
      await subscription.save();
      console.log('🚫 Subscription cancelada:', subscription._id);
    } else {
      console.warn('⚠️ Subscription não encontrada para cancelamento. Subscription ID:', subscriptionId);
    }

    return { success: true, message: 'Assinatura cancelada' };
  } catch (error: any) {
    console.error('❌ Erro ao processar cancelamento:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar renovação de assinatura (subscription_renewed)
async function handleSubscriptionRenewed(event: any) {
  console.log('🔄 Assinatura renovada (subscription_renewed)');
  console.log('📋 Evento:', JSON.stringify(event, null, 2));
  
  try {
    await connectDB();

    const eventData = event.data || event;
    const subscriptionId = eventData.subscription?.id;
    const customerEmail = eventData.customer?.email || eventData.subscription?.customer?.email;
    const nextPaymentDate = eventData.subscription?.next_payment_date;
    const recurrencePeriod = eventData.subscription?.recurrence_period; // em dias

    // Buscar subscription pelo ID da Cakto ou pelo email do usuário
    let subscription = null;
    
    if (subscriptionId) {
      subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId
      });
    }
    
    if (!subscription && customerEmail) {
      const user = await User.findOne({ email: customerEmail });
      if (user) {
        subscription = await Subscription.findOne({
          userId: user._id,
          status: 'active'
        });
      }
    }

    if (subscription) {
      // Atualizar período baseado na data de próximo pagamento ou período de recorrência
      if (nextPaymentDate) {
        subscription.currentPeriodEnd = new Date(nextPaymentDate);
        subscription.currentPeriodStart = new Date(); // Renovação começa agora
      } else if (recurrencePeriod) {
        // Calcular baseado no período de recorrência (em dias)
        const daysInMs = recurrencePeriod * 24 * 60 * 60 * 1000;
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + daysInMs);
      } else {
        // Fallback: usar billingCycle da subscription
        const days = subscription.billingCycle === 'yearly' ? 365 : 30;
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
      
      subscription.status = 'active';
      await subscription.save();

      // Atualizar usuário
      await User.findByIdAndUpdate(subscription.userId, {
        planEndDate: subscription.currentPeriodEnd
      });

      console.log('✅ Subscription renovada:', subscription._id);
      console.log('📅 Novo período:', {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd
      });
    } else {
      console.warn('⚠️ Subscription não encontrada para renovação. Subscription ID:', subscriptionId);
    }

    return { success: true, message: 'Renovação processada' };
  } catch (error: any) {
    console.error('❌ Erro ao processar renovação:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
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
    
    // A Cakto pode enviar eventos em formatos diferentes
    // Tentar detectar o tipo de evento
    const eventType = event.type || event.event || event.action;
    console.log('📊 Tipo de evento detectado:', eventType);

    let result;
    
    // Processar evento baseado no tipo (formatos reais da Cakto)
    switch (eventType) {
      case 'purchase_approved':
        // Pagamento aprovado (primeira compra ou renovação paga)
        result = await handlePaymentApproved(event);
        break;

      case 'payment.approved':
      case 'payment.succeeded':
      case 'payment.completed':
      case 'subscription.created':
        // Formatos alternativos (retrocompatibilidade)
        result = await handlePaymentApproved(event);
        break;
        
      case 'purchase_refused':
        // Compra recusada (formato real da Cakto)
        result = await handlePaymentFailed(event);
        break;

      case 'payment.failed':
      case 'payment.declined':
        // Formatos alternativos (retrocompatibilidade)
        result = await handlePaymentFailed(event);
        break;
        
      case 'refund':
        // Reembolso (formato real da Cakto)
        result = await handlePaymentRefunded(event);
        break;

      case 'payment.refunded':
      case 'refund.processed':
        // Formatos alternativos (retrocompatibilidade)
        result = await handlePaymentRefunded(event);
        break;
        
      case 'subscription_canceled':
      case 'subscription.cancelled':
      case 'subscription.canceled':
        // Assinatura cancelada
        result = await handleSubscriptionCancelled(event);
        break;

      case 'subscription_renewed':
      case 'subscription.renewed':
      case 'subscription.updated':
        // Renovação de assinatura
        result = await handleSubscriptionRenewed(event);
        break;
        
      default:
        console.log('⚠️ Evento não reconhecido:', eventType);
        console.log('📋 Evento completo:', JSON.stringify(event, null, 2));
        // Retornar sucesso mesmo para eventos não reconhecidos (para não bloquear webhooks)
        return NextResponse.json({ 
          success: true, 
          message: 'Evento recebido mas não processado',
          eventType 
        });
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
    webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sexyflow.onrender.com'}/api/webhooks/cakto`,
    eventsSupported: [
      'purchase_approved',      // Compra aprovada (formato real da Cakto)
      'purchase_refused',      // Compra recusada (formato real da Cakto)
      'subscription_canceled',  // Assinatura cancelada (formato real da Cakto)
      'subscription_renewed',   // Renovação (formato real da Cakto)
      'refund',                // Reembolso (formato real da Cakto)
      'chargeback'             // Chargeback (formato real da Cakto)
    ]
  });
}