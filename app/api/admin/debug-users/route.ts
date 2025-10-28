import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/debug-users - Listando todos os usuários');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário atual
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      console.log('❌ Usuário atual não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('👤 Usuário atual:', {
      email: currentUser.email,
      role: currentUser.role,
      sessionRole: session.user.role
    });

    // Buscar todos os usuários
    const users = await User.find({}, 'email name role createdAt').lean();
    
    console.log('📊 Total de usuários encontrados:', users.length);

    return NextResponse.json({
      currentUser: {
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        sessionRole: session.user.role,
        isAdmin: currentUser.role === 'ADMIN'
      },
      allUsers: users.map(user => ({
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      })),
      totalUsers: users.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
