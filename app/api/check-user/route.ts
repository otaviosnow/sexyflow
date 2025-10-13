import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Buscar todos os usuários
    const users = await User.find({}, 'email name role isActive').lean();

    return NextResponse.json({ 
      message: 'Usuários encontrados',
      users: users,
      total: users.length
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
