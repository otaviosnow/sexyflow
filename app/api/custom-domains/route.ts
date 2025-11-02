import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import CustomDomain from '@/models/CustomDomain';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { canUseCustomDomainWithSubscription } from '@/lib/utils/PlanRestrictions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar subscription do usuário
    const subscription = await Subscription.findOne({ userId: session.user.id });

    // Verificar se o usuário tem permissão para usar domínio customizado
    const restriction = canUseCustomDomainWithSubscription(subscription);
    if (!restriction.allowed) {
      return NextResponse.json({ 
        error: restriction.message || 'Seu plano não permite domínio customizado' 
      }, { status: 403 });
    }

    const domains = await CustomDomain.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('projectId', 'name subdomain');

    return NextResponse.json(domains);
  } catch (error) {
    console.error('Erro ao buscar domínios:', error);
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
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar subscription do usuário
    const subscription = await Subscription.findOne({ userId: session.user.id });

    // Verificar se o usuário tem permissão para usar domínio customizado
    const restriction = canUseCustomDomainWithSubscription(subscription);
    if (!restriction.allowed) {
      return NextResponse.json({ 
        error: restriction.message || 'Seu plano não permite domínio customizado' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { domain, projectId } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domínio é obrigatório' }, { status: 400 });
    }

    // Limpar e validar domínio
    let cleanDomain = domain.trim().toLowerCase();
    
    // Remover protocolo se presente
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    
    // Remover barra final se presente
    cleanDomain = cleanDomain.replace(/\/$/, '');
    
    // Remover www. se presente (normalizar)
    cleanDomain = cleanDomain.replace(/^www\./, '');

    // Validar formato
    const domainRegex = /^([a-z0-9-]+\.)+[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ 
        error: 'Formato de domínio inválido. Use exemplo.com' 
      }, { status: 400 });
    }

    // Verificar se já existe
    const existingDomain = await CustomDomain.findOne({ domain: cleanDomain });
    if (existingDomain) {
      return NextResponse.json({ 
        error: 'Este domínio já está em uso' 
      }, { status: 400 });
    }

    // Criar código de verificação único
    const verificationCode = `sf-${Math.random().toString(36).substring(2, 15)}`;

    // Criar domínio
    const customDomain = new CustomDomain({
      userId: user._id,
      projectId: projectId || undefined,
      domain: cleanDomain,
      status: 'pending',
      verificationCode
    });

    await customDomain.save();

    return NextResponse.json(customDomain, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar domínio:', error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Este domínio já está em uso' 
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
