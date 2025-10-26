import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Proteger rotas /admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-setup')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Se não estiver logado, redirecionar para login
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Se não for admin, redirecionar para projetos
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/projects', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}

