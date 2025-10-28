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

    // Verificar se o usuário tem plano ativo
    if (!user.planType || !user.planEndDate) {
      console.log('❌ Usuário sem plano ativo');
      return NextResponse.json({ error: 'Nenhum plano ativo' }, { status: 404 });
    }

    // Verificar se o plano não expirou
    const now = new Date();
    const endDate = new Date(user.planEndDate);
    
    if (endDate < now) {
      console.log('❌ Plano expirado');
      return NextResponse.json({ error: 'Plano expirado' }, { status: 404 });
    }

    console.log('✅ Plano ativo encontrado:', user.planType);

    // Retornar dados do plano no formato esperado
    const subscriptionData = {
      _id: user._id,
      planId: user.planType.toLowerCase(),
      planName: user.planType,
      status: 'active',
      currentPeriodStart: user.planStartDate,
      currentPeriodEnd: user.planEndDate,
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
