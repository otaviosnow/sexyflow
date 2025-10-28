import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/assign-test-plan - Atribuindo plano de teste');
    
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

    console.log('👤 Usuário encontrado:', user.email);

    // Atribuir plano de teste (1 mês)
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 mês a partir de agora

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        planType: 'MONTHLY',
        planStartDate: now,
        planEndDate: endDate
      },
      { new: true }
    );

    console.log('✅ Plano atribuído com sucesso!');
    console.log('📊 Detalhes do plano:', {
      planType: updatedUser.planType,
      planStartDate: updatedUser.planStartDate,
      planEndDate: updatedUser.planEndDate
    });

    return NextResponse.json({
      success: true,
      message: 'Plano de teste atribuído com sucesso!',
      plan: {
        type: updatedUser.planType,
        startDate: updatedUser.planStartDate,
        endDate: updatedUser.planEndDate
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atribuir plano:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
