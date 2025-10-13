import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

// Configuração do Stripe (você precisará configurar as variáveis de ambiente)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY;
const STRIPE_PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { planName, paymentMethodId } = body;

    if (!planName || !['monthly', 'annual'].includes(planName)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
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

    // Para desenvolvimento, vamos simular uma assinatura ativa
    // Em produção, aqui você integraria com Stripe/PagSeguro
    const now = new Date();
    const periodEnd = new Date();
    
    if (planName === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = new Subscription({
      userId: user._id,
      planId: planName,
      planName: planName,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false
    });

    await subscription.save();

    // Atualizar usuário
    await User.findByIdAndUpdate(user._id, {
      planType: planName === 'monthly' ? 'MONTHLY' : 'YEARLY',
      planStartDate: now,
      planEndDate: periodEnd
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: `Assinatura ${planName === 'monthly' ? 'mensal' : 'anual'} criada com sucesso!`
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
