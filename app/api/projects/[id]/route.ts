import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/projects/[id] - Buscando projeto:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se usuário existe
    const user = await User.findById(session.user.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Buscar projeto
    const project: any = await Project.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    }).lean();

    if (!project) {
      console.log('❌ Projeto não encontrado ou não pertence ao usuário');
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    console.log('✅ Projeto encontrado:', project.name);

    return NextResponse.json(project);
  } catch (error) {
    console.error('❌ Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 PUT /api/projects/[id] - Atualizando projeto:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se usuário existe
    const user = await User.findById(session.user.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, settings } = body;

    console.log('📦 Dados recebidos:', { name, description, settings });

    // Buscar projeto
    const project = await Project.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!project) {
      console.log('❌ Projeto não encontrado ou não pertence ao usuário');
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    console.log('✅ Projeto encontrado:', project.name);

    // Preparar dados de atualização
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings) {
      updateData.settings = {
        ...(project.settings || {}),
        ...settings
      };
    }

    // Atualizar projeto
    const updatedProject: any = await Project.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).lean();

    console.log('✅ Projeto atualizado com sucesso!');

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('❌ Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE /api/projects/[id] - Excluindo projeto:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se usuário existe
    const user = await User.findById(session.user.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    // Buscar projeto
    const project = await Project.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!project) {
      console.log('❌ Projeto não encontrado ou não pertence ao usuário');
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    console.log('✅ Projeto encontrado:', project.name);

    // Buscar e excluir todas as páginas do projeto
    const Page = require('@/models/Page').default;
    const pages = await Page.find({ projectId: params.id });
    
    if (pages.length > 0) {
      console.log(`🗑️ Excluindo ${pages.length} página(s) do projeto...`);
      await Page.deleteMany({ projectId: params.id });
      console.log('✅ Páginas excluídas com sucesso!');
    }

    // Excluir projeto do sistema (hard delete)
    await Project.findByIdAndDelete(params.id);

    console.log('✅ Projeto excluído com sucesso!');

    return NextResponse.json({ 
      message: 'Projeto e todas as suas páginas foram excluídos com sucesso',
      deletedId: params.id,
      deletedName: project.name,
      deletedPages: pages.length
    });
  } catch (error) {
    console.error('❌ Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

