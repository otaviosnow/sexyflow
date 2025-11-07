import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Page from '@/models/Page';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/projects/[id]/pages - Buscando páginas do projeto:', params.id);
    
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

    // Verificar se projeto pertence ao usuário
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

    // Buscar páginas do projeto
    const pages = await Page.find({
      projectId: params.id,
      isActive: true
    }).sort({ createdAt: -1 }).lean();

    console.log('✅ Páginas encontradas:', pages.length);

    return NextResponse.json(pages);
  } catch (error) {
    console.error('❌ Erro ao buscar páginas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 POST /api/projects/[id]/pages - Criando página no projeto:', params.id);
    
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

    // Verificar se projeto pertence ao usuário
    const project: any = await Project.findOne({
      _id: params.id,
      userId: user._id,
      isActive: true
    });

    if (!project) {
      console.log('❌ Projeto não encontrado ou não pertence ao usuário');
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    console.log('✅ Projeto encontrado:', project.name);

    // Verificar se o usuário tem assinatura ativa (exceto admins)
    if (user.role !== 'ADMIN') {
      const Subscription = require('@/models/Subscription').default;
      const subscription = await Subscription.findOne({
        userId: user._id,
        status: 'active'
      });

      if (!subscription) {
        console.log('❌ Usuário sem assinatura ativa');
        return NextResponse.json({ 
          error: 'Você precisa de uma assinatura ativa para criar páginas. Acesse /choose-plan para assinar um plano.',
          requiresSubscription: true
        }, { status: 402 });
      }

      // Verificar se a assinatura está realmente ativa
      const now = new Date();
      const isSubscriptionActive = subscription.status === 'active' && 
                                    subscription.currentPeriodEnd > now;
      
      if (!isSubscriptionActive) {
        console.log('❌ Assinatura não está ativa');
        return NextResponse.json({ 
          error: 'Sua assinatura não está ativa. Renove sua assinatura para continuar criando páginas.',
          requiresSubscription: true
        }, { status: 402 });
      }
    }

    const body = await request.json();
    const { title, slug, type, templateId, content } = body;

    console.log('📦 Dados recebidos:', { title, slug, type, templateId });

    if (!title || !slug || !type) {
      return NextResponse.json({ 
        error: 'Título, slug e tipo são obrigatórios' 
      }, { status: 400 });
    }

    // Verificar se slug já existe no projeto
    const existingPage = await Page.findOne({
      projectId: params.id,
      slug: slug.toLowerCase(),
      isActive: true
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

    // Criar página
    const page = new Page({
      title,
      slug: slug.toLowerCase(),
      type,
      projectId: params.id,
      userId: user._id,
      templateId: templateId || null,
      content: content || {
        elements: [],
        background: { type: 'color', value: '#ffffff', opacity: 1, image: '' }
      },
      isPublished: false,
      isActive: true
    });

    await page.save();

    console.log('✅ Página criada com sucesso!');

    return NextResponse.json({
      success: true,
      page,
      message: 'Página criada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao criar página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

