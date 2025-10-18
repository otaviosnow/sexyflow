import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    await connectDB();

    const template = await Template.findById(params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, description, content, previewImage, isActive } = body;

    await connectDB();

    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    // Atualizar template
    const updatedTemplate = await Template.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(content && { content }),
        ...(previewImage !== undefined && { previewImage }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    ).populate('createdBy', 'name email');

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se estamos em modo de desenvolvimento local
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      // Simular exclusão em desenvolvimento local
      console.log(`Template ${params.id} excluído (modo local)`);
      
      // Em desenvolvimento local, simular remoção do localStorage
      // (Isso será tratado no frontend)
      
      return NextResponse.json({ 
        message: 'Template excluído com sucesso (modo local)',
        templateId: params.id
      });
    }

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    await connectDB();

    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    await Template.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Template excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
