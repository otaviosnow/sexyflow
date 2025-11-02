import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { caktoService, getCaktoPlanData } from '@/lib/cakto';
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
      // Obter dados do plano na Cakto
      const planData = getCaktoPlanData(planId);
      
      // Extrair informações do plano
      const [_, planType, billingCycle] = planId.split('-'); // plan-starter-monthly -> ['plan', 'starter', 'monthly']
      const planName = planType.toUpperCase() as 'STARTER' | 'PRO';
      
      // Criar cliente na Cakto
      const caktoCustomer = await caktoService.createCustomer({
        name: customerData.name,
        email: customerData.email,
        document: customerData.document // CPF
      });

      // Criar plano na Cakto (se não existir)
      let caktoPlan;
      try {
        // Tentar criar o plano (pode já existir)
        caktoPlan = await caktoService.createPlan(planData);
        console.log('✅ Plano criado na Cakto:', caktoPlan.id);
      } catch (error: any) {
        // Se falhar, assumir que o plano já existe e buscar pelo nome
        console.log('⚠️ Plano pode já existir na Cakto, tentando buscar...');
        // Em produção, você pode buscar o plano existente aqui
      }

      // Criar assinatura na Cakto
      const caktoSubscription = await caktoService.createSubscription({
        customer_id: caktoCustomer.id,
        plan_id: planData.name, // Usar nome do plano para buscar/criar
        payment_method: paymentMethod
      });

      // Calcular billingCycle
      const finalBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';

      // Salvar assinatura no nosso banco
      const subscription = new Subscription({
        userId: user._id,
        planId: planId,
        planName: finalBillingCycle === 'yearly' ? 'yearly' : 'monthly', // Retrocompatibilidade
        realPlanName: planName,
        billingCycle: finalBillingCycle,
        status: caktoSubscription.status,
        currentPeriodStart: new Date(caktoSubscription.current_period_start),
        currentPeriodEnd: new Date(caktoSubscription.current_period_end),
        cancelAtPeriodEnd: caktoSubscription.cancel_at_period_end,
        stripeSubscriptionId: caktoSubscription.id, // ID da assinatura na Cakto
        stripeCustomerId: caktoCustomer.id // ID do cliente na Cakto
      });

      await subscription.save();

      // Atualizar usuário
      await User.findByIdAndUpdate(user._id, {
        planType: finalBillingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY',
        planStartDate: new Date(caktoSubscription.current_period_start),
        planEndDate: new Date(caktoSubscription.current_period_end)
      });

      console.log(`✅ Assinatura criada: ${planName} (${finalBillingCycle}) para usuário ${user.email}`);

      return NextResponse.json({
        success: true,
        subscription,
        caktoSubscription,
        message: `Assinatura ${planName} (${finalBillingCycle === 'yearly' ? 'anual' : 'mensal'}) criada com sucesso!`
      });

    } catch (caktoError: any) {
      console.error('❌ Erro na integração com Cakto:', caktoError);
      
      return NextResponse.json({
        error: 'Erro ao processar pagamento',
        details: caktoError.message || 'Erro desconhecido na Cakto'
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
