import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Teste simples funcionando!',
    timestamp: new Date().toISOString()
  });
}
