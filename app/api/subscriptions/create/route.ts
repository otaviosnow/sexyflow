import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { caktoService, CAKTO_PLANS } from '@/lib/cakto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { planName, paymentMethod, customerData } = body;

    if (!planName || !['monthly', 'annual'].includes(planName)) {
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
      // Criar cliente na Cakto
      const caktoCustomer = await caktoService.createCustomer({
        name: customerData.name,
        email: customerData.email,
        document: customerData.document // CPF
      });

      // Criar plano na Cakto (se não existir)
      const planData = CAKTO_PLANS[planName];
      let caktoPlan;
      try {
        // Tentar criar o plano (pode já existir)
        caktoPlan = await caktoService.createPlan(planData);
      } catch (error) {
        // Se falhar, assumir que o plano já existe
        console.log('Plano pode já existir na Cakto');
      }

      // Criar assinatura na Cakto
      const caktoSubscription = await caktoService.createSubscription({
        customer_id: caktoCustomer.id,
        plan_id: planData.name, // Usar nome do plano
        payment_method: paymentMethod
      });

      // Salvar assinatura no nosso banco
      const subscription = new Subscription({
        userId: user._id,
        planId: planName,
        planName: planName,
        status: caktoSubscription.status,
        currentPeriodStart: new Date(caktoSubscription.current_period_start),
        currentPeriodEnd: new Date(caktoSubscription.current_period_end),
        cancelAtPeriodEnd: caktoSubscription.cancel_at_period_end,
        stripeSubscriptionId: caktoSubscription.id, // Reutilizando campo
        stripeCustomerId: caktoCustomer.id // Reutilizando campo
      });

      await subscription.save();

      // Atualizar usuário
      await User.findByIdAndUpdate(user._id, {
        planType: planName === 'monthly' ? 'MONTHLY' : 'YEARLY',
        planStartDate: new Date(caktoSubscription.current_period_start),
        planEndDate: new Date(caktoSubscription.current_period_end)
      });

      return NextResponse.json({
        success: true,
        subscription,
        caktoSubscription,
        message: `Assinatura ${planName === 'monthly' ? 'mensal' : 'anual'} criada com sucesso!`
      });

    } catch (caktoError: any) {
      console.error('Erro na integração com Cakto:', caktoError);
      
      return NextResponse.json({
        error: 'Erro ao processar pagamento',
        details: caktoError.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
