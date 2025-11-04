import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Subscription from '@/models/Subscription';
import PageViewDaily from '@/models/PageViewDaily';
import Page from '@/models/Page';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/projects - Listando projetos');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Usuário autenticado:', session.user.email);

    await connectDB();

    // Buscar TODOS os projetos do usuário (incluindo inativos para debug)
    const allProjects = await Project.find({ 
      userId: session.user.id
    }).sort({ createdAt: -1 });

    console.log('🔍 Todos os projetos do usuário:', allProjects.map(p => ({
      id: p._id,
      name: p.name,
      isActive: p.isActive,
      createdAt: p.createdAt
    })));

    // Filtrar apenas os ativos
    const projects = allProjects.filter(p => p.isActive === true);

    console.log(`📊 Projetos ativos encontrados: ${projects.length}`);

    // Buscar visualizações totais para cada projeto
    const projectsWithViews = await Promise.all(
      projects.map(async (project: any) => {
        // Buscar todas as páginas do projeto
        const pages = await Page.find({ projectId: project._id }).select('_id').lean();
        const pageIds = pages.map((p: any) => p._id);
        
        // Calcular total de visualizações
        const viewsAgg = await PageViewDaily.aggregate([
          { $match: { pageId: { $in: pageIds } } },
          { $group: { _id: null, total: { $sum: '$count' } } }
        ]);
        
        const totalViews = viewsAgg[0]?.total || 0;
        
        return {
          ...project.toObject(),
          totalViews
        };
      })
    );

    return NextResponse.json(projectsWithViews);
  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/projects - Criando projeto');
    
    // Usar NextAuth para autenticação segura
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    const body = await request.json();
    const { name, subdomain, description, customDomainId } = body;

    console.log('📦 Dados recebidos:', { name, subdomain, description, customDomainId });

    if (!name) {
      console.log('❌ Dados obrigatórios faltando');
      return NextResponse.json({ error: 'Nome do projeto é obrigatório' }, { status: 400 });
    }

    if (!subdomain && !customDomainId) {
      console.log('❌ Dados obrigatórios faltando');
      return NextResponse.json({ error: 'Subdomínio ou domínio próprio é obrigatório' }, { status: 400 });
    }

    // Se usar domínio próprio, buscar o CustomDomain
    let customDomain = null;
    let finalSubdomain = subdomain;

    if (customDomainId) {
      const CustomDomain = require('@/models/CustomDomain').default;
      customDomain = await CustomDomain.findById(customDomainId);

      if (!customDomain) {
        console.log('❌ Domínio próprio não encontrado');
        return NextResponse.json({ error: 'Domínio próprio não encontrado' }, { status: 404 });
      }

      if (customDomain.userId.toString() !== session.user.id) {
        console.log('❌ Domínio próprio não pertence ao usuário');
        return NextResponse.json({ error: 'Domínio próprio não pertence a você' }, { status: 403 });
      }

      if (customDomain.status !== 'verified') {
        console.log('❌ Domínio próprio não está verificado');
        return NextResponse.json({ error: 'Domínio próprio deve estar verificado para ser usado' }, { status: 400 });
      }

      if (customDomain.projectId) {
        console.log('❌ Domínio próprio já está associado a um projeto');
        return NextResponse.json({ error: 'Domínio próprio já está associado a outro projeto' }, { status: 400 });
      }

      // Usar o domínio como identificador único (sem pontos, apenas para subdomain interno)
      finalSubdomain = customDomain.domain.replace(/\./g, '-').toLowerCase();
      console.log('✅ Domínio próprio validado:', customDomain.domain, '-> subdomain interno:', finalSubdomain);
    }

    // Buscar usuário autenticado via NextAuth session
    const user = await User.findById(session.user.id);
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    console.log('✅ Usuário encontrado:', user.email, 'Role:', user.role);
    
    // Admins não precisam de assinatura
    if (user.role !== 'ADMIN') {
      console.log('🔍 Verificando assinatura do usuário...');
      
      // Verificar se o usuário tem assinatura ativa
      const subscription = await Subscription.findOne({
        userId: user._id,
        status: { $in: ['active', 'past_due'] }
      });

      console.log('📋 Subscription encontrada:', subscription ? 'Sim' : 'Não');

      // TEMPORÁRIO: Permitir criação sem assinatura para debug
      if (!subscription) {
        console.log('⚠️ Usuário sem assinatura - permitindo criar projeto (DEBUG MODE)');
        // return NextResponse.json({ 
        //   error: 'Você precisa de uma assinatura ativa para criar projetos',
        //   requiresSubscription: true
        // }, { status: 402 });
      }
    } else {
      console.log('✅ Admin - pulando verificação de assinatura');
    }

    // Verificar se existe QUALQUER projeto com esse subdomínio (independente do isActive)
    console.log('🔍 Verificando QUALQUER projeto com subdomínio:', finalSubdomain.toLowerCase());
    const anyExistingProject = await Project.findOne({ 
      subdomain: finalSubdomain.toLowerCase()
    });
    
    if (anyExistingProject) {
      console.log('📋 Projeto encontrado no banco:', {
        id: anyExistingProject._id,
        name: anyExistingProject.name,
        subdomain: anyExistingProject.subdomain,
        isActive: anyExistingProject.isActive,
        userId: anyExistingProject.userId
      });
      
      // Se o projeto está ativo, retornar erro
      if (anyExistingProject.isActive === true) {
        console.log('❌ Subdomínio já existe (projeto ativo):', finalSubdomain);
        return NextResponse.json({ error: 'Este subdomínio já está em uso' }, { status: 400 });
      }
      
      // Se o projeto não está ativo (false, null, undefined), reutilizar
      console.log('ℹ️ Projeto encontrado mas não ativo - reutilizando...');
      
      // Reativar o projeto existente
      anyExistingProject.userId = user._id;
      anyExistingProject.name = name;
      anyExistingProject.description = description;
      anyExistingProject.isActive = true;
      anyExistingProject.pages = [];
      anyExistingProject.updatedAt = new Date();
      
      await anyExistingProject.save();
      console.log('✅ Projeto reutilizado com sucesso:', anyExistingProject.name);

      // Se foi usado domínio próprio, associar ao projeto
      if (customDomain) {
        customDomain.projectId = anyExistingProject._id;
        await customDomain.save();
        console.log('✅ Domínio próprio associado ao projeto reutilizado');
      }

      return NextResponse.json({
        success: true,
        project: anyExistingProject,
        message: 'Projeto criado com sucesso! (reutilizando subdomínio)',
        url: customDomain ? `https://${customDomain.domain}` : `https://${anyExistingProject.subdomain}.${process.env.BASE_DOMAIN || 'sexyflow.com.br'}`
      });
    }
    console.log('✅ Nenhum projeto encontrado com esse subdomínio');

    // Validar subdomínio apenas se não for domínio próprio
    if (!customDomainId) {
      const subdomainRegex = /^[a-z0-9-]+$/;
      if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 50) {
        console.log('❌ Subdomínio inválido:', subdomain);
        return NextResponse.json({ 
          error: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens (3-50 caracteres)' 
        }, { status: 400 });
      }
    }

    // Verificar limite de projetos baseado no plano
    const userProjects = await Project.find({ 
      userId: user._id,
      isActive: true 
    });

    console.log(`📊 Usuário possui ${userProjects.length} projeto(s) ativo(s)`);

    // Buscar assinatura para verificar limite
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'past_due'] }
    });

    let projectLimit = 1; // Padrão: 1 projeto

    if (subscription) {
      // Mapear plano para limite de projetos
      const planLimits: { [key: string]: number } = {
        'starter': 1,
        'pro': 3,
        'enterprise': -1 // Ilimitado
      };

      projectLimit = planLimits[subscription.planId] || 1;
      console.log(`📋 Plano ${subscription.planId}: limite de ${projectLimit === -1 ? 'ilimitados' : projectLimit} projetos`);
    }

    // Verificar se atingiu o limite (exceto para planos ilimitados)
    if (projectLimit !== -1 && userProjects.length >= projectLimit) {
      console.log(`❌ Usuário atingiu limite de projetos (${userProjects.length}/${projectLimit})`);
      return NextResponse.json({ 
        error: `Você atingiu o limite de ${projectLimit} projeto(s) do seu plano. Faça upgrade para criar mais projetos.` 
      }, { status: 400 });
    }

    console.log('✅ Validações passaram, criando projeto...');

    // Criar projeto
    const project = new Project({
      userId: user._id,
      name,
      subdomain: finalSubdomain.toLowerCase(),
      description,
      isActive: true,
      pages: []
    });

    // Se for domínio próprio, salvar nas settings
    if (customDomain) {
      project.settings = {
        customDomain: customDomain.domain
      };
    }

    await project.save();
    console.log('✅ Projeto criado com sucesso:', {
      id: project._id,
      name: project.name,
      subdomain: project.subdomain,
      isActive: project.isActive,
      userId: project.userId,
      customDomain: customDomain?.domain
    });

    // Se foi usado domínio próprio, associar ao projeto
    if (customDomain) {
      customDomain.projectId = project._id;
      await customDomain.save();
      console.log('✅ Domínio próprio associado ao projeto:', customDomain.domain);
    }

    // Verificar se o projeto foi salvo corretamente
    const savedProject = await Project.findById(project._id);
    console.log('🔍 Projeto verificado no banco:', {
      id: savedProject?._id,
      name: savedProject?.name,
      isActive: savedProject?.isActive,
      userId: savedProject?.userId
    });

    console.log('✅ Projeto salvo, gerando URL...');
    
    let projectUrl = '';
    if (customDomain) {
      projectUrl = `https://${customDomain.domain}`;
      console.log('✅ URL gerada (domínio próprio):', projectUrl);
    } else {
      try {
        projectUrl = project.getFullUrl();
        console.log('✅ URL gerada:', projectUrl);
      } catch (urlError) {
        console.error('❌ Erro ao gerar URL:', urlError);
        const baseDomain = process.env.BASE_DOMAIN || 'seu-dominio.com.br';
        projectUrl = `https://${project.subdomain}.${baseDomain}`;
      }
    }

    return NextResponse.json({
      success: true,
      project,
      message: 'Projeto criado com sucesso!',
      url: projectUrl
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar projeto:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
