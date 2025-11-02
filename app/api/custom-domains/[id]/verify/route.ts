import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import CustomDomain from '@/models/CustomDomain';
import { promises as dns } from 'dns';

// Função para verificar DNS CNAME
async function verifyDNSCNAME(domain: string): Promise<boolean> {
  try {
    const targetHost = process.env.BASE_DOMAIN || 'sexyflow.onrender.com';
    
    // Verificar www.{domain}
    const wwwDomain = `www.${domain}`;
    
    try {
      // Tentar resolver CNAME para www.{domain}
      const records = await dns.resolveCname(wwwDomain);
      
      // Verificar se algum registro aponta para nosso domínio
      const isValid = records.some(record => 
        record.toLowerCase().includes(targetHost.toLowerCase())
      );
      
      if (isValid) {
        console.log(`✅ DNS verificado: ${wwwDomain} -> ${records.join(', ')}`);
        return true;
      }
      
      console.log(`⚠️ DNS não aponta corretamente: ${wwwDomain} -> ${records.join(', ')}`);
      
      // Se não encontrar em www, tentar verificar o domínio raiz (apenas A record pode apontar para IP)
      // Mas para CNAME, sempre verificamos www
      return false;
    } catch (dnsError: any) {
      // Se não encontrar CNAME, pode ser que ainda não esteja configurado
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        console.log(`⚠️ DNS não encontrado para ${wwwDomain}`);
        return false;
      }
      
      // Outro erro DNS
      console.error(`❌ Erro DNS ao verificar ${wwwDomain}:`, dnsError);
      return false;
    }
  } catch (error) {
    console.error('Erro na verificação DNS:', error);
    return false;
  }
}

// Função alternativa usando verificação TXT para código de verificação
async function verifyDNSTXT(domain: string, verificationCode: string): Promise<boolean> {
  try {
    const txtRecord = `_sexyflow-verify.${domain}`;
    
    try {
      const records = await dns.resolveTxt(txtRecord);
      
      // Verificar se algum registro contém o código de verificação
      const isValid = records.some(recordArray => {
        const fullRecord = recordArray.join('');
        return fullRecord.includes(verificationCode);
      });
      
      if (isValid) {
        console.log(`✅ TXT record verificado: ${txtRecord}`);
        return true;
      }
      
      return false;
    } catch (dnsError: any) {
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        return false;
      }
      throw dnsError;
    }
  } catch (error) {
    console.error('Erro ao verificar TXT record:', error);
    return false;
  }
}

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

    console.log(`🔍 Iniciando verificação DNS para: ${domain.domain}`);

    // Verificar DNS usando CNAME (método principal)
    let dnsVerified = await verifyDNSCNAME(domain.domain);
    
    // Se CNAME não funcionar, tentar verificar via TXT record (método alternativo)
    if (!dnsVerified && domain.verificationCode) {
      console.log(`🔄 Tentando verificação via TXT record...`);
      dnsVerified = await verifyDNSTXT(domain.domain, domain.verificationCode);
    }
    
    if (dnsVerified) {
      domain.status = 'verified';
      domain.verifiedAt = new Date();
      await domain.save();
      
      console.log(`✅ Domínio ${domain.domain} verificado com sucesso!`);
      
      return NextResponse.json({ 
        message: 'Domínio verificado com sucesso!',
        domain 
      });
    } else {
      domain.status = 'failed';
      await domain.save();
      
      console.log(`❌ Falha na verificação DNS para ${domain.domain}`);
      
      return NextResponse.json({ 
        error: 'Verificação falhou. Verifique se configurou o registro CNAME apontando www.{seu-dominio} para sexyflow.onrender.com nas configurações DNS do seu domínio.',
        details: {
          requiredCNAME: `www.${domain.domain}`,
          targetValue: process.env.BASE_DOMAIN || 'sexyflow.onrender.com'
        }
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erro ao verificar domínio:', error);
    
    // Atualizar status como failed em caso de erro
    try {
      await connectDB();
      const domain = await CustomDomain.findById(params.id);
      if (domain) {
        domain.status = 'failed';
        await domain.save();
      }
    } catch (saveError) {
      console.error('Erro ao salvar status de falha:', saveError);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor durante verificação DNS',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
