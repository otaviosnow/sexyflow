import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Page from '@/models/Page';

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

    const page = await Page.findOne({ 
      _id: params.id, 
      userId: session.user.id 
    });

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
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

    const body = await request.json();
    const { title, slug, description, content, isPublished } = body;

    await connectDB();

    const page = await Page.findOne({ 
      _id: params.id, 
      userId: session.user.id 
    });

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    // Verificar se o slug já existe para outro usuário
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({ 
        userId: session.user.id, 
        slug,
        _id: { $ne: params.id }
      });
      
      if (existingPage) {
        return NextResponse.json(
          { error: 'Já existe uma página com este slug' },
          { status: 400 }
        );
      }
    }

    // Atualizar página
    const updatedPage = await Page.findByIdAndUpdate(
      params.id,
      {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(content && { content }),
        ...(isPublished !== undefined && { isPublished }),
      },
      { new: true }
    );

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
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

    await connectDB();

    const page = await Page.findOne({ 
      _id: params.id, 
      userId: session.user.id 
    });

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    await Page.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Página excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
