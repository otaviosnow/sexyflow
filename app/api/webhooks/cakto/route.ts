import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { caktoService } from '@/lib/cakto';
import Subscription from '@/models/Subscription';
import Project from '@/models/Project';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-cakto-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    // Verificar webhook
    if (!caktoService.verifyWebhook(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);
    await connectDB();

    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;

      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(event.data);
        break;

      default:
        console.log('Evento não tratado:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook da Cakto:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Assinatura criada na Cakto:', subscription.id);
  
  // A assinatura já foi criada no nosso banco durante o processo de criação
  // Aqui podemos fazer validações adicionais se necessário
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Assinatura atualizada na Cakto:', subscription.id);
  
  const ourSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id // Reutilizando campo para Cakto ID
  });

  if (ourSubscription) {
    ourSubscription.status = subscription.status;
    ourSubscription.currentPeriodStart = new Date(subscription.current_period_start);
    ourSubscription.currentPeriodEnd = new Date(subscription.current_period_end);
    ourSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    await ourSubscription.save();
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log('Assinatura cancelada na Cakto:', subscription.id);
  
  const ourSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id
  });

  if (ourSubscription) {
    ourSubscription.status = 'canceled';
    ourSubscription.canceledAt = new Date();
    
    await ourSubscription.save();
  }
}

async function handlePaymentSucceeded(payment: any) {
  console.log('Pagamento aprovado na Cakto:', payment.id);
  
  // Encontrar assinatura relacionada
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: payment.subscription_id
  });

  if (subscription) {
    // Renovar período se necessário
    if (subscription.status === 'past_due') {
      subscription.status = 'active';
      await subscription.save();
    }
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('Pagamento falhou na Cakto:', payment.id);
  
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: payment.subscription_id
  });

  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();
  }
}

async function handleSubscriptionPastDue(subscription: any) {
  console.log('Assinatura em atraso na Cakto:', subscription.id);
  
  const ourSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id
  });

  if (ourSubscription) {
    ourSubscription.status = 'past_due';
    
    // Definir período de graça (7 dias)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    ourSubscription.gracePeriodEnd = gracePeriodEnd;
    
    await ourSubscription.save();
  }
}

// Job para limpeza automática (será chamado por cron job)
export async function GET() {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Encontrar assinaturas expiradas no período de graça
    const expiredSubscriptions = await Subscription.find({
      gracePeriodEnd: { $lt: now },
      status: { $in: ['past_due', 'canceled'] }
    });

    for (const subscription of expiredSubscriptions) {
      // Encontrar projeto do usuário
      const project = await Project.findOne({
        userId: subscription.userId,
        isActive: true
      });

      if (project) {
        // Desativar projeto e páginas
        project.isActive = false;
        await project.save();

        console.log(`Projeto ${project.subdomain} desativado para usuário ${subscription.userId}`);
      }
    }

    return NextResponse.json({
      message: `Processadas ${expiredSubscriptions.length} assinaturas expiradas`
    });
  } catch (error) {
    console.error('Erro na limpeza automática:', error);
    return NextResponse.json({ error: 'Cleanup error' }, { status: 500 });
  }
}
