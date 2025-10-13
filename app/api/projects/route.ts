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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, subdomain, description } = body;

    if (!name || !subdomain) {
      return NextResponse.json({ error: 'Nome e subdomínio são obrigatórios' }, { status: 400 });
    }

    // Verificar se o usuário tem assinatura ativa
    const subscription = await Subscription.findOne({
      userId: session.user.id,
      status: { $in: ['active', 'past_due'] }
    });

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Você precisa de uma assinatura ativa para criar projetos',
        requiresSubscription: true
      }, { status: 402 });
    }

    // Verificar se o subdomínio já existe
    const existingProject = await Project.findOne({ subdomain: subdomain.toLowerCase() });
    if (existingProject) {
      return NextResponse.json({ error: 'Este subdomínio já está em uso' }, { status: 400 });
    }

    // Validar subdomínio
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 50) {
      return NextResponse.json({ 
        error: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens (3-50 caracteres)' 
      }, { status: 400 });
    }

    // Verificar se já tem um projeto (limite de 1 por usuário)
    const existingUserProject = await Project.findOne({ 
      userId: session.user.id,
      isActive: true 
    });

    if (existingUserProject) {
      return NextResponse.json({ 
        error: 'Você já possui um projeto ativo. Cada usuário pode ter apenas 1 projeto.' 
      }, { status: 400 });
    }

    // Criar projeto
    const project = new Project({
      userId: session.user.id,
      name,
      subdomain: subdomain.toLowerCase(),
      description,
      isActive: true,
      pages: []
    });

    await project.save();

    return NextResponse.json({
      success: true,
      project,
      message: 'Projeto criado com sucesso!',
      url: project.getFullUrl()
    });

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
