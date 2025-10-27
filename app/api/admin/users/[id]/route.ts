import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Page from '@/models/Page';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/admin/users/[id] - Buscando usuário:', params.id);
    
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

    // Buscar usuário específico
    const user: any = await User.findById(params.id)
      .select('name email role createdAt isActive')
      .lean();

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Buscar subscription do usuário
    const Subscription = require('@/models/Subscription').default;
    const subscription = await Subscription.findOne({ userId: params.id }).lean();

    if (subscription) {
      // Mapear de volta para o formato de exibição
      const planDisplayMapping: { [key: string]: string } = {
        'monthly': 'STARTER',
        'annual': 'PRO'
      };

      user.subscription = {
        plan: planDisplayMapping[subscription.planName] || subscription.planName,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      };
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
