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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Em desenvolvimento local, permitir login com qualquer credencial
        const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
        
        if (isLocalDev) {
          // Mock user para desenvolvimento local
          return {
            id: 'dev-user-123',
            email: credentials.email.toLowerCase(),
            name: credentials.email.split('@')[0],
            role: 'ADMIN',
            subdomain: credentials.email.split('@')[0].toLowerCase(),
          };
        }

        await connectDB();
        
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
          isActive: true
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          subdomain: user.subdomain,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subdomain = user.subdomain;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.subdomain = token.subdomain as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
