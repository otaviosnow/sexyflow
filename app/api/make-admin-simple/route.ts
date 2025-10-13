import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Buscar o usuário teste90@gmail.com
    const user = await User.findOne({ email: 'teste90@gmail.com' });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário teste90@gmail.com não encontrado' }, { status: 404 });
    }

    // Mostrar status atual
    const currentStatus = {
      email: user.email,
      name: user.name,
      role: user.role,
      subdomain: user.subdomain,
      isActive: user.isActive
    };

    // Tornar administrador se não for
    if (user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await user.save();
      
      return NextResponse.json({ 
        message: '✅ Usuário teste90@gmail.com PROMOVIDO a ADMINISTRADOR',
        before: currentStatus,
        after: {
          email: user.email,
          name: user.name,
          role: user.role,
          subdomain: user.subdomain,
          isActive: user.isActive
        }
      });
    } else {
      return NextResponse.json({ 
        message: '✅ Usuário teste90@gmail.com JÁ É ADMINISTRADOR',
        status: currentStatus
      });
    }

  } catch (error) {
    console.error('Erro ao verificar/promover usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
