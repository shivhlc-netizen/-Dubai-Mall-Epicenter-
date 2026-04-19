import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { queryOne } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;

        // 1. Try Database First
        try {
          const user = await queryOne<any>(
            'SELECT id, name, email, password_hash, role, is_premium FROM users WHERE email = ? AND active = 1',
            [email]
          );

          if (user) {
            // Check password (supports both hardcoded and bcrypt)
            const isHardcoded = (email === 'admin@dubaimall.ae' && password === 'S#iv2026') ||
                               (email === 'hlc@dubaimall.ae' && password === 'HLC2026') ||
                               (email === 'shivshambhu@dubaimall.ae' && password === 'Premium2026');
            
            const isValid = isHardcoded || await bcrypt.compare(password, user.password_hash);

            if (isValid) {
              return { 
                id: user.id.toString(), 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                is_premium: !!user.is_premium 
              };
            }
          }
        } catch (err) {
          console.error('[AUTH] DB error:', err);
        }

        // 2. Fallback to Hardcoded (for initial setup/failsafe)
        if (email === 'admin@dubaimall.ae' && password === 'S#iv2026') {
          return { id: '1', name: 'Admin', email: 'admin@dubaimall.ae', role: 'admin', is_premium: true };
        }
        if (email === 'hlc@dubaimall.ae' && password === 'HLC2026') {
          return { id: '2', name: 'HLC Manager', email: 'hlc@dubaimall.ae', role: 'manager', is_premium: true };
        }
        if (email === 'shivshambhu@dubaimall.ae' && password === 'Premium2026') {
          return { id: '3', name: 'Shiv Shambhu', email: 'shivshambhu@dubaimall.ae', role: 'user', is_premium: true };
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id as string;
        token.is_premium = (user as any).is_premium ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).is_premium = token.is_premium;
      }
      return session;
    },
  },
};

import { getServerSession } from 'next-auth';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (session?.user && (session.user as any).role === 'admin') return session;
  return null;
}

export async function requireManager() {
  const session = await getSession();
  const role = session?.user ? (session.user as any).role : null;
  if (role === 'admin' || role === 'manager') return session;
  return null;
}
