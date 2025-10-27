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
    const project = await Project.findOne({
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
    const { name, description } = body;

    console.log('📦 Dados recebidos:', { name, description });

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

    // Atualizar projeto
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
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

    // Desativar projeto (soft delete)
    await Project.findByIdAndUpdate(params.id, { isActive: false });

    console.log('✅ Projeto desativado com sucesso!');

    return NextResponse.json({ 
      message: 'Projeto excluído com sucesso',
      deletedId: params.id,
      deletedName: project.name
    });
  } catch (error) {
    console.error('❌ Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

