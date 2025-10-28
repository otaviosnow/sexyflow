import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/check-user-role - Verificando role do usuário');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário no banco
    const user = await User.findById(session.user.id);
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('👤 Usuário encontrado:', {
      email: user.email,
      role: user.role,
      sessionRole: session.user.role
    });

    return NextResponse.json({
      email: user.email,
      name: user.name,
      role: user.role,
      sessionRole: session.user.role,
      isAdmin: user.role === 'ADMIN',
      sessionIsAdmin: session.user.role === 'ADMIN'
    });

  } catch (error) {
    console.error('❌ Erro ao verificar role:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
