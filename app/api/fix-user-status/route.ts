import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 POST /api/fix-user-status - Corrigindo status dos usuários');
    
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

    // Buscar todos os usuários com isActive undefined ou null
    const usersToFix = await User.find({
      $or: [
        { isActive: { $exists: false } },
        { isActive: null },
        { isActive: undefined }
      ]
    });

    console.log(`🔍 Encontrados ${usersToFix.length} usuários para corrigir`);

    // Atualizar todos os usuários
    const updateResult = await User.updateMany(
      {
        $or: [
          { isActive: { $exists: false } },
          { isActive: null },
          { isActive: undefined }
        ]
      },
      { $set: { isActive: true } }
    );

    console.log(`✅ ${updateResult.modifiedCount} usuários corrigidos`);

    // Verificar o usuário específico
    const testUser = await User.findOne({ email: 'teste3@gmail.com' });
    console.log(`🔍 Status do teste3@gmail.com após correção: ${testUser?.isActive}`);

    return NextResponse.json({
      message: `Status corrigido para ${updateResult.modifiedCount} usuários`,
      fixedUsers: updateResult.modifiedCount,
      testUserStatus: testUser?.isActive
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir status dos usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
