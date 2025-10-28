import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o plano está ativo
    const now = new Date();
    const isPlanActive = user.planEndDate && user.planEndDate > now;
    
    const userData = {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      planType: user.planType || 'Nenhum plano',
      planStartDate: user.planStartDate ? user.planStartDate.toLocaleDateString('pt-BR') : 'Não definida',
      planEndDate: user.planEndDate ? user.planEndDate.toLocaleDateString('pt-BR') : 'Não definida',
      isPlanActive: isPlanActive,
      customDomain: user.customDomain || 'Nenhum',
      subdomain: user.subdomain || 'Nenhum',
      createdAt: user.createdAt.toLocaleDateString('pt-BR'),
      updatedAt: user.updatedAt.toLocaleDateString('pt-BR')
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Erro ao consultar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
