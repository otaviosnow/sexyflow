import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Project from '@/models/Project';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/pages/[id] - Buscando página:', params.id);
    
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

    // Buscar página
    const page: any = await Page.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    }).lean();

    if (!page) {
      console.log('❌ Página não encontrada ou não pertence ao usuário');
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    console.log('✅ Página encontrada:', page.title);

    return NextResponse.json(page);
  } catch (error) {
    console.error('❌ Erro ao buscar página:', error);
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
    console.log('📝 PUT /api/pages/[id] - Atualizando página:', params.id);
    
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

    const body = await request.json();
    const { title, slug, content, isPublished } = body;

    console.log('📦 Dados recebidos:', { title, slug, isPublished });

    // Buscar página
    const page: any = await Page.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!page) {
      console.log('❌ Página não encontrada ou não pertence ao usuário');
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    console.log('✅ Página encontrada:', page.title);

    // Se está mudando o slug, verificar se não existe outro com o mesmo slug no projeto
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({
        projectId: page.projectId,
        slug: slug.toLowerCase(),
        isActive: true,
        _id: { $ne: params.id }
      });

      if (existingPage) {
        console.log('❌ Slug já existe no projeto');
        return NextResponse.json({ 
          error: 'Este slug já está em uso neste projeto' 
        }, { status: 400 });
      }

      // Validar slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug) || slug.length < 2 || slug.length > 50) {
        return NextResponse.json({ 
          error: 'Slug inválido. Use apenas letras minúsculas, números e hífens (2-50 caracteres)' 
        }, { status: 400 });
      }
    }

    // Atualizar página
    const updatedPage = await Page.findByIdAndUpdate(
      params.id,
      {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase() }),
        ...(content && { content }),
        ...(isPublished !== undefined && { isPublished }),
      },
      { new: true }
    ).lean();

    console.log('✅ Página atualizada com sucesso!');

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('❌ Erro ao atualizar página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 PATCH /api/pages/[id] - Atualizando página:', params.id);
    
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

    const body = await request.json();
    const { title, slug, content, isPublished } = body;

    console.log('📦 Dados recebidos:', { title, slug, isPublished });

    // Buscar página
    const page: any = await Page.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!page) {
      console.log('❌ Página não encontrada ou não pertence ao usuário');
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    console.log('✅ Página encontrada:', page.title);

    // Se está mudando o slug, verificar se não existe outro com o mesmo slug no projeto
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({
        projectId: page.projectId,
        slug: slug.toLowerCase(),
        isActive: true,
        _id: { $ne: params.id }
      });

      if (existingPage) {
        console.log('❌ Slug já existe no projeto');
        return NextResponse.json({ 
          error: 'Este slug já está em uso neste projeto' 
        }, { status: 400 });
      }

      // Validar slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug) || slug.length < 2 || slug.length > 50) {
        return NextResponse.json({ 
          error: 'Slug inválido. Use apenas letras minúsculas, números e hífens (2-50 caracteres)' 
        }, { status: 400 });
      }
    }

    // Atualizar página
    const updatedPage = await Page.findByIdAndUpdate(
      params.id,
      {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase() }),
        ...(content && { content }),
        ...(isPublished !== undefined && { isPublished }),
      },
      { new: true }
    ).lean();

    console.log('✅ Página atualizada com sucesso!');

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('❌ Erro ao atualizar página:', error);
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
    console.log('🗑️ DELETE /api/pages/[id] - Excluindo página:', params.id);
    
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

    // Buscar página
    const page: any = await Page.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!page) {
      console.log('❌ Página não encontrada ou não pertence ao usuário');
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    console.log('✅ Página encontrada:', page.title);

    // Desativar página (soft delete)
    await Page.findByIdAndUpdate(params.id, { isActive: false });

    console.log('✅ Página desativada com sucesso!');

    return NextResponse.json({ 
      message: 'Página excluída com sucesso',
      deletedId: params.id,
      deletedTitle: page.title
    });
  } catch (error) {
    console.error('❌ Erro ao excluir página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
