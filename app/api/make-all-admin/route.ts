import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é desenvolvimento local
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (!isLocalDev) {
      return NextResponse.json({ 
        error: 'Esta funcionalidade só está disponível em desenvolvimento local' 
      }, { status: 403 });
    }

    await connectDB();

    // Promover todos os usuários a admin
    const result = await User.updateMany(
      { role: { $ne: 'ADMIN' } }, // Todos que não são admin
      { role: 'ADMIN' }
    );

    // Buscar todos os usuários para mostrar o resultado
    const users = await User.find({}, 'name email role');

    return NextResponse.json({ 
      success: true,
      message: `${result.modifiedCount} usuários promovidos a ADMINISTRADOR`,
      modifiedCount: result.modifiedCount,
      users: users
    });

  } catch (error) {
    console.error('Erro ao promover usuários:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
