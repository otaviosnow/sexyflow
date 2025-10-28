import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Subscription from '@/models/Subscription';

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

    return NextResponse.json(projects);
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
    const { name, subdomain, description } = body;

    console.log('📦 Dados recebidos:', { name, subdomain, description });

    if (!name || !subdomain) {
      console.log('❌ Dados obrigatórios faltando');
      return NextResponse.json({ error: 'Nome e subdomínio são obrigatórios' }, { status: 400 });
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
    console.log('🔍 Verificando QUALQUER projeto com subdomínio:', subdomain.toLowerCase());
    const anyExistingProject = await Project.findOne({ 
      subdomain: subdomain.toLowerCase()
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
        console.log('❌ Subdomínio já existe (projeto ativo):', subdomain);
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

      return NextResponse.json({
        success: true,
        project: anyExistingProject,
        message: 'Projeto criado com sucesso! (reutilizando subdomínio)',
        url: `https://${anyExistingProject.subdomain}.sexyflow.onrender.com`
      });
    }
    console.log('✅ Nenhum projeto encontrado com esse subdomínio');

    // Validar subdomínio
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 50) {
      console.log('❌ Subdomínio inválido:', subdomain);
      return NextResponse.json({ 
        error: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens (3-50 caracteres)' 
      }, { status: 400 });
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
      subdomain: subdomain.toLowerCase(),
      description,
      isActive: true,
      pages: []
    });

    await project.save();
    console.log('✅ Projeto criado com sucesso:', {
      id: project._id,
      name: project.name,
      subdomain: project.subdomain,
      isActive: project.isActive,
      userId: project.userId
    });

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
    try {
      projectUrl = project.getFullUrl();
      console.log('✅ URL gerada:', projectUrl);
    } catch (urlError) {
      console.error('❌ Erro ao gerar URL:', urlError);
      projectUrl = `https://${project.subdomain}.sexyflow.onrender.com`;
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
