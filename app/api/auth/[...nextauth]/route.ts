import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Debug: verificar se authOptions está carregado
console.log('🔍 NextAuth configurado com:', {
  providers: authOptions.providers?.length || 0,
  pages: authOptions.pages,
  secret: authOptions.secret ? 'DEFINIDO' : 'NÃO DEFINIDO'
});
