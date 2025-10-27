import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PATCH /api/admin/users/[id]/plan - Alterando plano do usuário:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se usuário é admin
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      console.log('❌ Acesso negado - usuário não é admin');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { plan } = body;

    console.log('📦 Novo plano:', plan);

    // Mapear plano para o formato do modelo Subscription
    const planMapping: { [key: string]: string } = {
      'STARTER': 'monthly',
      'PRO': 'annual',
      'ENTERPRISE': 'annual'
    };

    const mappedPlan = planMapping[plan] || 'monthly';

    // Verificar se usuário existe
    const user = await User.findById(params.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar ou criar assinatura
    let subscription = await Subscription.findOne({ userId: params.id });
    
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    if (!subscription) {
      // Criar nova assinatura
      subscription = new Subscription({
        userId: params.id,
        planId: mappedPlan,
        planName: mappedPlan,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      });
    } else {
      // Atualizar plano existente
      subscription.planId = mappedPlan;
      subscription.planName = mappedPlan;
      subscription.status = 'active';
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
    }

    await subscription.save();

    console.log(`✅ Plano do usuário ${user.email} alterado para: ${plan} (${mappedPlan})`);

    return NextResponse.json({ 
      message: `Plano alterado para ${plan} com sucesso`,
      subscription: {
        plan: plan,
        planName: mappedPlan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao alterar plano do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

