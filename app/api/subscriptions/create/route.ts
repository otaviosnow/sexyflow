import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { getCaktoCheckoutLink } from '@/lib/cakto';
import { getPlanByNameAndBilling } from '@/lib/models/Plan';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { planId, paymentMethod, customerData } = body;

    // planId deve ser do formato: plan-starter-monthly, plan-pro-yearly, etc
    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'Plano (planId) é obrigatório' }, { status: 400 });
    }

    // Validar planId
    const validPlanIds = ['plan-starter-monthly', 'plan-starter-yearly', 'plan-pro-monthly', 'plan-pro-yearly'];
    if (!validPlanIds.includes(planId)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    if (!paymentMethod || !customerData) {
      return NextResponse.json({ error: 'Dados de pagamento e cliente são obrigatórios' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se já tem uma assinatura ativa
    const existingSubscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'past_due'] }
    });

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'Você já possui uma assinatura ativa',
        subscription: existingSubscription
      }, { status: 400 });
    }

    try {
      // Extrair informações do plano
      const [_, planType, billingCycle] = planId.split('-'); // plan-starter-monthly -> ['plan', 'starter', 'monthly']
      const planName = planType.toUpperCase() as 'STARTER' | 'PRO';
      const finalBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';

      // Obter link de checkout configurado manualmente na Cakto
      // Adiciona parâmetros userId e planId na URL para identificar no webhook
      const checkoutUrl = getCaktoCheckoutLink(planId, user._id.toString());

      // Criar assinatura pendente no nosso banco (será ativada quando o webhook confirmar o pagamento)
      // O webhook da Cakto deve incluir metadata com userId e planId
      const subscription = new Subscription({
        userId: user._id,
        planId: planId,
        planName: finalBillingCycle === 'yearly' ? 'yearly' : 'monthly',
        realPlanName: planName,
        billingCycle: finalBillingCycle,
        status: 'pending', // Pendente até confirmação via webhook
        currentPeriodStart: new Date(),
        currentPeriodEnd: finalBillingCycle === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 dias
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        cancelAtPeriodEnd: false
        // stripeSubscriptionId e stripeCustomerId serão preenchidos quando o webhook chegar
      });

      await subscription.save();

      console.log(`✅ Link de checkout obtido para ${planName} (${finalBillingCycle}) - usuário ${user.email}`);
      console.log(`🔗 URL: ${checkoutUrl}`);
      console.log(`📝 Subscription ID: ${subscription._id} (aguardando webhook)`);

      // Retornar link de checkout para redirecionamento
      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutUrl,
        subscription: {
          id: subscription._id,
          status: subscription.status
        },
        message: 'Redirecione o usuário para o link de checkout para completar o pagamento'
      });

    } catch (error: any) {
      console.error('❌ Erro ao obter link de checkout:', error);
      
      return NextResponse.json({
        error: 'Erro ao obter link de checkout',
        details: error.message || 'Link de checkout não configurado. Configure as variáveis de ambiente CAKTO_CHECKOUT_*'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
