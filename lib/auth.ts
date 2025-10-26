import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';

export async function getAuthUser(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return !!session;
}

// Exportar authOptions para compatibilidade
export { authOptions };
