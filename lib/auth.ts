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
            console.log('❌ CREDENCIAIS FALTANDO');
            return null;
          }

          console.log('🔍 TENTANDO AUTENTICAR:', credentials.email);
          console.log('🔍 SENHA RECEBIDA:', credentials.password);
          
          await connectDB();
          console.log('✅ CONECTADO AO MONGODB');
          
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true
          });

          if (!user) {
            console.log('❌ USUÁRIO NÃO ENCONTRADO:', credentials.email);
            return null;
          }
          
          console.log('✅ USUÁRIO ENCONTRADO:', user.email);
          console.log('🔍 SENHA NO BD:', user.password ? 'EXISTE' : 'NÃO EXISTE');

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔍 SENHA VÁLIDA?', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ SENHA INVÁLIDA - ACESSO NEGADO');
            return null;
          }

          console.log('✅ AUTENTICAÇÃO BEM-SUCEDIDA');

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subdomain: user.subdomain || '',
          };
        } catch (error) {
          console.error('❌ ERRO NA AUTENTICAÇÃO:', error);
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
