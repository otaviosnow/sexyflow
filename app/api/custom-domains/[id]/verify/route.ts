import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import CustomDomain from '@/models/CustomDomain';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await connectDB();

    const domain = await CustomDomain.findById(params.id);
    if (!domain) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    // Verificar se o domínio pertence ao usuário
    if (domain.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Simular verificação DNS
    // Em produção, aqui você faria uma verificação real via DNS
    // Por enquanto, vamos apenas atualizar o status como "verificado" após um delay
    
    // Simular verificação (em produção, fazer verificação real de DNS)
    const dnsVerified = true; // Placeholder - implementar verificação real de DNS
    
    if (dnsVerified) {
      domain.status = 'verified';
      domain.verifiedAt = new Date();
      await domain.save();
      
      return NextResponse.json({ 
        message: 'Domínio verificado com sucesso!',
        domain 
      });
    } else {
      domain.status = 'failed';
      await domain.save();
      
      return NextResponse.json({ 
        error: 'Verificação falhou. Verifique as configurações DNS.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao verificar domínio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
