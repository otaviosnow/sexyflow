import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * ⚠️ ROTA PROTEGIDA - Apenas ADMIN
 * 
 * Esta rota executa o seed do banco de dados.
 * NÃO deve ser executada em produção após a configuração inicial!
 * 
 * Templates NÃO serão recriados se já existirem.
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Não autorizado. Faça login como admin.' 
      }, { status: 401 });
    }

    await connectDB();

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Acesso negado. Apenas administradores podem executar o seed.' 
      }, { status: 403 });
    }

    console.log('🔐 Seed autorizado pelo admin:', user.email);

    // Importar e executar seed diretamente
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Executar seed
    const { stdout, stderr } = await execAsync('npm run db:seed');
    
    return NextResponse.json({ 
      success: true,
      message: 'Seed executado com sucesso',
      output: stdout,
      errors: stderr,
      note: 'Templates existentes NÃO foram sobrescritos'
    });
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return NextResponse.json({ 
      error: 'Erro ao executar seed',
      details: error.message 
    }, { status: 500 });
  }
}
