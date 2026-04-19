import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id as string;
        token.is_premium = (user as any).is_premium ?? false;
        token.admin_preferences = (user as any).admin_preferences;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
        (session.user as any).is_premium = token.is_premium ?? false;
        (session.user as any).admin_preferences = token.admin_preferences;
      }
      return session;
    },
  },
};

export async function getSession() {
  return { user: { id: 1, name: 'Demo User', email: 'demo@dubai.ae', role: 'admin' as const } }
}
export async function requireAdmin() {
  return { user: { id: 1, name: 'Demo Admin', email: 'demo@dubai.ae', role: 'admin' as const } }
}
export async function requireManager() {
  return { user: { id: 1, name: 'Demo Manager', email: 'demo@dubai.ae', role: 'manager' as const } }
}
