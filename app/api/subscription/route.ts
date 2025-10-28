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

    // Buscar assinatura ativa
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'past_due', 'canceled'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      console.log('❌ Nenhuma assinatura encontrada');
      return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 });
    }

    console.log('✅ Assinatura encontrada:', subscription.planId);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
