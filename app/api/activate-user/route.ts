import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/activate-user - Ativando usuário');
    
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
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Ativar usuário
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { isActive: true },
      { new: true }
    );

    console.log(`✅ Usuário ${email} ativado com sucesso!`);

    return NextResponse.json({
      message: `Usuário ${email} ativado com sucesso!`,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('❌ Erro ao ativar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
