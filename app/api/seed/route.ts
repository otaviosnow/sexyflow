import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
      errors: stderr
    });
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return NextResponse.json({ 
      error: 'Erro ao executar seed',
      details: error.message 
    }, { status: 500 });
  }
}
