import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Buscar o usuário teste90@gmail.com
    const user = await User.findOne({ email: 'teste90@gmail.com' });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário teste90@gmail.com não encontrado' }, { status: 404 });
    }

    // Tornar administrador
    user.role = 'ADMIN';
    await user.save();

    return NextResponse.json({ 
      message: '✅ Usuário teste90@gmail.com agora é ADMINISTRADOR',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        subdomain: user.subdomain
      }
    });

  } catch (error) {
    console.error('Erro ao tornar usuário admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
