import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Buscar o usuário teste90@gmail.com
    const user = await User.findOne({ email: 'teste90@gmail.com' });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário teste90@gmail.com não encontrado',
        suggestion: 'Verifique se o usuário foi criado corretamente'
      }, { status: 404 });
    }

    // Mostrar status atual
    const beforeStatus = {
      email: user.email,
      name: user.name,
      role: user.role,
      subdomain: user.subdomain,
      isActive: user.isActive
    };

    // Tornar administrador
    user.role = 'ADMIN';
    await user.save();
    
    return NextResponse.json({ 
      success: true,
      message: '✅ Usuário teste90@gmail.com PROMOVIDO a ADMINISTRADOR',
      before: beforeStatus,
      after: {
        email: user.email,
        name: user.name,
        role: user.role,
        subdomain: user.subdomain,
        isActive: user.isActive
      },
      instructions: [
        '1. Faça logout da aplicação',
        '2. Faça login novamente com teste90@gmail.com',
        '3. O botão "Painel Admin" deve aparecer no dashboard'
      ]
    });

  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
