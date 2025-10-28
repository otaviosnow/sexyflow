import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

export async function POST(request: NextRequest) {
  try {
    console.log('📉 POST /api/subscription/downgrade - Fazendo downgrade');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID é obrigatório' }, { status: 400 });
    }

    // Buscar usuário
    const user = await User.findById(session.user.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Buscar assinatura atual
    const currentSubscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'past_due'] }
    });

    if (!currentSubscription) {
      console.log('❌ Nenhuma assinatura ativa encontrada');
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 404 });
    }

    console.log('✅ Assinatura atual:', currentSubscription.planId);

    // Atualizar assinatura
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      currentSubscription._id,
      {
        planId,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ Assinatura atualizada para:', planId);

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Downgrade realizado com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao fazer downgrade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
