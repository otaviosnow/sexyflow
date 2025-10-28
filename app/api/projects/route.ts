import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Subscription from '@/models/Subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const projects = await Project.find({ 
      userId: session.user.id,
      isActive: true 
    }).populate('pages').sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
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

    // Verificar se o subdomínio já existe (apenas projetos ativos)
    const existingProject = await Project.findOne({ 
      subdomain: subdomain.toLowerCase(),
      isActive: true 
    });
    
    // Log para debug: verificar se existe projeto inativo com mesmo subdomínio
    const inactiveProject = await Project.findOne({ 
      subdomain: subdomain.toLowerCase(),
      isActive: false 
    });
    if (inactiveProject) {
      console.log('ℹ️ Existe projeto INATIVO com esse subdomínio (será reutilizado)');
    }
    
    if (existingProject) {
      console.log('❌ Subdomínio já existe (projeto ativo):', subdomain);
      return NextResponse.json({ error: 'Este subdomínio já está em uso' }, { status: 400 });
    }

    // Validar subdomínio
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 50) {
      console.log('❌ Subdomínio inválido:', subdomain);
      return NextResponse.json({ 
        error: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens (3-50 caracteres)' 
      }, { status: 400 });
    }

    // Verificar se já tem um projeto (limite de 1 por usuário)
    const existingUserProject = await Project.findOne({ 
      userId: user._id,
      isActive: true 
    });

    if (existingUserProject) {
      console.log('❌ Usuário já possui projeto ativo');
      return NextResponse.json({ 
        error: 'Você já possui um projeto ativo. Cada usuário pode ter apenas 1 projeto.' 
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
    console.log('✅ Projeto criado com sucesso:', project.name);

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
