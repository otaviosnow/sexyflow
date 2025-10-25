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
          console.log('========================================');
          console.log('🔐 INICIANDO AUTENTICAÇÃO');
          console.log('Email:', credentials?.email);
          console.log('Senha fornecida:', credentials?.password ? 'SIM' : 'NÃO');
          console.log('========================================');
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ CREDENCIAIS FALTANDO');
            return null;
          }

          console.log('1️⃣ Conectando ao MongoDB...');
          await connectDB();
          console.log('✅ MongoDB conectado');

          console.log('2️⃣ Buscando usuário:', credentials.email.toLowerCase());
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true
          });

          if (!user) {
            console.log('❌ USUÁRIO NÃO ENCONTRADO');
            return null;
          }
          
          console.log('✅ Usuário encontrado:', user.email);
          console.log('3️⃣ Verificando senha...');

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Senha válida?', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ SENHA INVÁLIDA');
            return null;
          }

          console.log('✅ AUTENTICAÇÃO BEM-SUCEDIDA');
          console.log('========================================');

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subdomain: user.subdomain || '',
          };
        } catch (error) {
          console.error('❌ ERRO:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
