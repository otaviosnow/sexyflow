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
    const { plan, billingCycle } = body; // billingCycle: 'monthly' | 'yearly'

    console.log('📦 Novo plano:', plan, 'Billing Cycle:', billingCycle);

    // Validar billingCycle
    const validBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    
    // Para ENTERPRISE, sempre usar yearly (mas pode ser ajustado)
    const finalBillingCycle = plan === 'ENTERPRISE' ? 'yearly' : validBillingCycle;

    // Calcular duração do período
    const now = new Date();
    let periodEnd: Date;
    
    if (finalBillingCycle === 'yearly') {
      // 365 dias para plano anual
      periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else {
      // 30 dias para plano mensal
      periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Criar planId baseado no plano e billingCycle
    const planId = `plan-${plan.toLowerCase()}-${finalBillingCycle === 'yearly' ? 'yearly' : 'monthly'}`;

    // Verificar se usuário existe
    const user = await User.findById(params.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar ou criar assinatura
    let subscription = await Subscription.findOne({ userId: params.id });

    if (!subscription) {
      // Criar nova assinatura
      subscription = new Subscription({
        userId: params.id,
        planId: planId,
        planName: finalBillingCycle === 'yearly' ? 'yearly' : 'monthly', // Para retrocompatibilidade
        realPlanName: plan as 'STARTER' | 'PRO' | 'ENTERPRISE',
        billingCycle: finalBillingCycle,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      });
    } else {
      // Atualizar plano existente
      subscription.planId = planId;
      subscription.planName = finalBillingCycle === 'yearly' ? 'yearly' : 'monthly'; // Para retrocompatibilidade
      subscription.realPlanName = plan as 'STARTER' | 'PRO' | 'ENTERPRISE';
      subscription.billingCycle = finalBillingCycle;
      subscription.status = 'active';
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
    }

    await subscription.save();

    // Atualizar também o modelo User
    const userPlanType = finalBillingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    await User.findByIdAndUpdate(params.id, {
      planType: userPlanType,
      planStartDate: now,
      planEndDate: periodEnd
    });

    console.log(`✅ Plano do usuário ${user.email} alterado para: ${plan} (${finalBillingCycle})`);
    console.log(`📊 Duração: ${finalBillingCycle === 'yearly' ? '365 dias' : '30 dias'}`);
    console.log(`📅 Válido até: ${periodEnd.toLocaleDateString('pt-BR')}`);

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

