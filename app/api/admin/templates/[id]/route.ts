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

    await connectDB();

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

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
    console.log('📝 PUT /api/admin/templates/[id] - Iniciando atualização');
    console.log('🆔 Template ID:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      console.log('❌ Acesso negado - não é admin');
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    console.log('✅ Usuário é admin:', user.email);

    const body = await request.json();
    const { name, type, description, content, previewImage, isActive } = body;

    console.log('📦 Dados recebidos:');
    console.log('  - name:', name);
    console.log('  - type:', type);
    console.log('  - content:', content);
    console.log('  - content.elements:', content?.elements?.length || 0, 'elementos');
    console.log('  - content.background:', content?.background);

    const template = await Template.findById(params.id);

    if (!template) {
      console.log('❌ Template não encontrado:', params.id);
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    console.log('📄 Template encontrado:', template.name);

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

    console.log('✅ Template atualizado com sucesso!');
    console.log('📊 Elementos salvos:', updatedTemplate.content?.elements?.length || 0);

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
    console.log('🗑️ Tentando excluir template:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      console.log('❌ Acesso negado - não é admin');
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    console.log('✅ Usuário é admin:', user.email);

    const template = await Template.findById(params.id);

    if (!template) {
      console.log('❌ Template não encontrado:', params.id);
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    console.log('📄 Template encontrado:', template.name);

    const result = await Template.findByIdAndDelete(params.id);
    
    if (result) {
      console.log('✅ Template DELETADO com sucesso do MongoDB:', result._id);
    } else {
      console.log('⚠️ findByIdAndDelete retornou null');
    }

    return NextResponse.json({ 
      message: 'Template excluído com sucesso',
      deletedId: params.id,
      deletedName: template.name
    });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
