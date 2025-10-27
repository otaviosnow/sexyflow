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
        plan: plan,
        status: 'active',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      });
    } else {
      // Atualizar plano existente
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    }

    await subscription.save();

    console.log(`✅ Plano do usuário ${user.email} alterado para: ${plan}`);

    return NextResponse.json({ 
      message: `Plano alterado para ${plan} com sucesso`,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Erro ao alterar plano do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

