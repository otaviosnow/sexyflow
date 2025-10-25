import { NextRequest } from 'next/server';

export function getAuthUser(request: NextRequest) {
  return null;
}

export function requireAuth(request: NextRequest) {
  return true;
}

// Exportar authOptions para compatibilidade
export const authOptions = {};
