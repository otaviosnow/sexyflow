import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciais faltando');
            return null;
          }

          console.log('🔍 Tentando autenticar:', credentials.email);
          
          await connectDB();
          
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true
          });

          if (!user) {
            console.log('❌ Usuário não encontrado:', credentials.email);
            return null;
          }
          
          console.log('✅ Usuário encontrado:', user.email);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('❌ Senha inválida');
            return null;
          }

          console.log('✅ Autenticação bem-sucedida');

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subdomain: user.subdomain || '',
          };
        } catch (error) {
          console.error('❌ Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subdomain = user.subdomain;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subdomain = token.subdomain as string;
      }
      return session;
    },
  },
};
