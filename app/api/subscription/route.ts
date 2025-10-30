import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/subscription - Buscando assinatura');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await User.findById(session.user.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('📊 Dados do plano do usuário:', {
      planType: user.planType,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate
    });

    // Normalizar tipos de plano e validar datas (aceitar planos sem datas explícitas)
    const rawPlanType = (user.planType || '').toString().trim().toUpperCase();
    const planMap: Record<string, string> = {
      STARTER: 'starter',
      PRO: 'pro',
      ENTERPRISE: 'enterprise',
      MONTHLY: 'pro',
      YEARLY: 'pro'
    };

    const planId = planMap[rawPlanType];

    if (!planId) {
      console.log('❌ Usuário sem plano mapeável:', rawPlanType);
      return NextResponse.json({ error: 'Nenhum plano ativo' }, { status: 404 });
    }

    // Datas: se não houver datas salvas, criar uma janela padrão de 30 dias para exibição
    const now = new Date();
    const startDate = user.planStartDate ? new Date(user.planStartDate) : now;
    const endDate = user.planEndDate ? new Date(user.planEndDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (endDate < now) {
      console.log('❌ Plano expirado (endDate < now)');
      return NextResponse.json({ error: 'Plano expirado' }, { status: 404 });
    }

    console.log('✅ Plano ativo encontrado:', rawPlanType, '→', planId);

    // Retornar dados do plano no formato esperado pela UI
    const subscriptionData = {
      _id: user._id,
      planId,
      planName: rawPlanType,
      status: 'active',
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false,
      createdAt: user.createdAt
    };

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
