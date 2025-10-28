import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/debug-users - Teste simples');
    
    return NextResponse.json({
      message: 'Endpoint funcionando!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no endpoint:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
