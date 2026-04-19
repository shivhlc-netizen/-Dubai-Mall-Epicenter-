import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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

        // Admin Mode
        if (email === 'admin@dubaimall.ae' && password === 'S#iv2026') {
          return { id: '1', name: 'Admin', email: 'admin@dubaimall.ae', role: 'admin', is_premium: true };
        }
        // HLC Mode
        if (email === 'hlc@dubaimall.ae' && password === 'HLC2026') {
          return { id: '2', name: 'HLC Manager', email: 'hlc@dubaimall.ae', role: 'manager', is_premium: true };
        }
        // Shiv Shambhu Premium User
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

export async function getSession() {
  return null;
}
export async function requireAdmin() {
  return null;
}
export async function requireManager() {
  return null;
}
