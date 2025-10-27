import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE /api/admin/users/[id] - Excluindo usuário:', params.id);
    
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

    // Não permitir excluir a si mesmo
    if (params.id === session.user.id) {
      console.log('❌ Não é possível excluir seu próprio usuário');
      return NextResponse.json(
        { error: 'Não é possível excluir seu próprio usuário' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await User.findById(params.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Excluir usuário
    await User.findByIdAndDelete(params.id);

    console.log('✅ Usuário excluído com sucesso!');

    return NextResponse.json({ 
      message: 'Usuário excluído com sucesso',
      deletedId: params.id 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

