import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';

// Configurações da Cakto
const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || '0082bb51-0cf7-4b49-8f69-11400a59b6e3';

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

// Processar evento de pagamento aprovado
async function handlePaymentApproved(event: any) {
  console.log('💰 Pagamento aprovado:', event.data);
  
  try {
    await connectDB();

    // Extrair dados do evento (a Cakto pode enviar de várias formas)
    // 1. Via metadata no evento
    const metadata = event.data?.metadata || event.metadata || event.data?.custom_data || {};
    
    // 2. Via query parameters na URL de retorno (se a Cakto enviar)
    const queryParams = event.data?.query_params || event.query_params || {};
    
    // 3. Via campos diretos no evento
    const userId = 
      metadata.userId || 
      queryParams.userId ||
      event.data?.userId || 
      event.userId ||
      event.data?.customer_id;
      
    const planId = 
      metadata.planId || 
      queryParams.planId ||
      event.data?.planId || 
      event.planId ||
      event.data?.product_id ||
      event.data?.plan_name;
    
    const paymentId = event.data?.paymentId || event.data?.id || event.id || event.data?.transaction_id;
    
    console.log('📋 Dados extraídos do webhook:', { 
      userId, 
      planId, 
      paymentId,
      metadata: Object.keys(metadata),
      eventKeys: Object.keys(event.data || event)
    });
    
    if (!userId || !planId) {
      console.error('❌ Dados incompletos no webhook. Tentando buscar subscription pendente...');
      console.error('📋 Evento completo:', JSON.stringify(event, null, 2));
      
      // Tentar buscar por paymentId se tiver
      if (paymentId) {
        const pendingSub = await Subscription.findOne({
          stripeSubscriptionId: paymentId
        });
        if (pendingSub) {
          console.log('✅ Encontrada subscription pendente pelo paymentId:', pendingSub._id);
          // Usar dados da subscription encontrada
          const foundUserId = pendingSub.userId.toString();
          const foundPlanId = pendingSub.planId;
          return await activateSubscription(foundUserId, foundPlanId, paymentId, pendingSub);
        }
      }
      
      return { success: false, message: 'Dados incompletos no webhook (userId e planId não encontrados)' };
    }

    return await activateSubscription(userId, planId, paymentId, null);
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de pagamento falhado
async function handlePaymentFailed(event: any) {
  console.log('❌ Pagamento falhado:', event.data);
  
  try {
    await connectDB();

    const metadata = event.data.metadata || event.metadata || {};
    const userId = metadata.userId || event.data.userId;
    const paymentId = event.data.paymentId || event.data.id || event.id;

    // Buscar subscription pelo paymentId
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: paymentId
    });

    if (subscription) {
      subscription.status = 'unpaid';
      await subscription.save();
      console.log('⚠️ Subscription marcada como unpaid:', subscription._id);
    }

    console.log('⚠️ Pagamento falhado para usuário:', userId);
    
    return { success: true, message: 'Status de pagamento atualizado' };
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento falhado:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de reembolso
async function handlePaymentRefunded(event: any) {
  console.log('🔄 Reembolso processado:', event.data);
  
  try {
    await connectDB();

    const metadata = event.data.metadata || event.metadata || {};
    const userId = metadata.userId || event.data.userId;
    const paymentId = event.data.paymentId || event.data.id || event.id;

    // Buscar e cancelar subscription
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: paymentId
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      await subscription.save();
      console.log('💸 Subscription cancelada por reembolso:', subscription._id);
    }

    console.log('💸 Reembolso processado para usuário:', userId);
    
    return { success: true, message: 'Reembolso processado' };
  } catch (error: any) {
    console.error('❌ Erro ao processar reembolso:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar evento de assinatura cancelada ou renovação
async function handleSubscriptionCancelled(event: any) {
  console.log('🚫 Assinatura cancelada:', event.data);
  
  try {
    await connectDB();

    const subscriptionId = event.data.subscriptionId || event.data.id;
    const userId = event.data.customer_id ? 
      await Subscription.findOne({ stripeCustomerId: event.data.customer_id }).then(s => s?.userId) :
      null;

    // Buscar subscription
    const subscription = await Subscription.findOne({
      $or: [
        { stripeSubscriptionId: subscriptionId },
        { stripeCustomerId: event.data.customer_id }
      ]
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.cancelAtPeriodEnd = true;
      subscription.canceledAt = new Date();
      await subscription.save();
      console.log('🚫 Subscription cancelada:', subscription._id);
    }

    return { success: true, message: 'Assinatura cancelada' };
  } catch (error: any) {
    console.error('❌ Erro ao processar cancelamento:', error);
    return { success: false, message: error.message || 'Erro interno do servidor' };
  }
}

// Processar renovação de assinatura (pagamento recorrente)
async function handleSubscriptionRenewed(event: any) {
  console.log('🔄 Assinatura renovada:', event.data);
  
  try {
    await connectDB();

    const subscriptionId = event.data.subscriptionId || event.data.id;

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: subscriptionId
    });

    if (subscription) {
      // Atualizar período
      subscription.currentPeriodStart = new Date(event.data.current_period_start || Date.now());
      subscription.currentPeriodEnd = new Date(event.data.current_period_end || 
        (subscription.billingCycle === 'yearly' 
          ? Date.now() + 365 * 24 * 60 * 60 * 1000 
          : Date.now() + 30 * 24 * 60 * 60 * 1000));
      subscription.status = 'active';
      await subscription.save();

      // Atualizar usuário
      await User.findByIdAndUpdate(subscription.userId, {
        planEndDate: subscription.currentPeriodEnd
      });

      console.log('✅ Subscription renovada:', subscription._id);
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
    
    // Processar evento baseado no tipo
    switch (eventType) {
      case 'payment.approved':
      case 'payment.succeeded':
      case 'payment.completed':
      case 'subscription.created':
        // Pagamento aprovado ou assinatura criada
        result = await handlePaymentApproved(event);
        break;
        
      case 'payment.failed':
      case 'payment.declined':
        // Pagamento falhado
        result = await handlePaymentFailed(event);
        break;
        
      case 'payment.refunded':
      case 'refund.processed':
        // Reembolso
        result = await handlePaymentRefunded(event);
        break;
        
      case 'subscription.cancelled':
      case 'subscription.canceled':
        // Assinatura cancelada
        result = await handleSubscriptionCancelled(event);
        break;

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
      'payment.approved',
      'payment.failed',
      'payment.refunded',
      'subscription.created',
      'subscription.cancelled',
      'subscription.renewed'
    ]
  });
}