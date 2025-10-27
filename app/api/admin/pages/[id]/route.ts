import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Page from '@/models/Page';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE /api/admin/pages/[id] - Excluindo página:', params.id);
    
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

    // Buscar página
    const page = await Page.findById(params.id);
    if (!page) {
      console.log('❌ Página não encontrada');
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    // Excluir página
    await Page.findByIdAndDelete(params.id);
    console.log('✅ Página excluída com sucesso!');

    return NextResponse.json({ 
      message: 'Página excluída com sucesso',
      deletedId: params.id 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

