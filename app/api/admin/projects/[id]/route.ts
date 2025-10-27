import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Page from '@/models/Page';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE /api/admin/projects/[id] - Excluindo projeto:', params.id);
    
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

    // Buscar projeto
    const project = await Project.findById(params.id);
    if (!project) {
      console.log('❌ Projeto não encontrado');
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Excluir todas as páginas do projeto primeiro
    await Page.deleteMany({ projectId: params.id });
    console.log('✅ Páginas do projeto excluídas');

    // Excluir projeto
    await Project.findByIdAndDelete(params.id);
    console.log('✅ Projeto excluído com sucesso!');

    return NextResponse.json({ 
      message: 'Projeto e suas páginas excluídos com sucesso',
      deletedId: params.id 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

