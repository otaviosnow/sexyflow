import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  console.log('🌐 Middleware - Host:', hostname);
  console.log('🌐 Middleware - URL:', url.pathname);
  
  // Pular middleware para rotas de API, arquivos estáticos e admin
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/projects') ||
    url.pathname.startsWith('/choose-plan') ||
    url.pathname.startsWith('/pricing') ||
    url.pathname.startsWith('/payment') ||
    url.pathname.includes('.')  // arquivos com extensão (css, js, etc)
  ) {
    return NextResponse.next();
  }
  
  // Extrair subdomínio
  const baseDomain = process.env.BASE_DOMAIN || 'sexyflow.onrender.com';
  const parts = hostname.split('.');
  
  console.log('🔍 Parts:', parts);
  console.log('🔍 Base domain:', baseDomain);
  
  // Verificar se é um subdomínio (não é o domínio principal)
  if (hostname.includes(baseDomain) && !hostname.startsWith('www.')) {
    const subdomain = parts[0];
    
    // Se não for o domínio principal
    if (subdomain && subdomain !== 'sexyflow' && subdomain !== 'www') {
      console.log('✅ Subdomínio detectado:', subdomain);
      
      // Reescrever URL para servir o conteúdo do projeto
      // Redireciona para /site/[subdomain]/[...path]
      url.pathname = `/site/${subdomain}${url.pathname}`;
      
      console.log('🔄 Reescrevendo para:', url.pathname);
      
      return NextResponse.rewrite(url);
    }
  }
  
  // Se for localhost ou desenvolvimento
  if (hostname.includes('localhost')) {
    const subdomain = parts[0];
    
    if (subdomain && subdomain !== 'localhost' && subdomain.includes('-')) {
      // Formato: subdomain-localhost:3000
      const actualSubdomain = subdomain.split('-')[0];
      console.log('✅ Subdomínio local detectado:', actualSubdomain);
      
      url.pathname = `/site/${actualSubdomain}${url.pathname}`;
      console.log('🔄 Reescrevendo para:', url.pathname);
      
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

