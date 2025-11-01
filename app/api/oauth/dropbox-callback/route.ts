import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/library?error=${encodeURIComponent(error)}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/library?error=no_code', req.url));
  }

  // Redirecionar para /library mostrando o código
  return NextResponse.redirect(new URL(`/library?dropbox_code=${code}`, req.url));
}

