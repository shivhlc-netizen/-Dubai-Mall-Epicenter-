import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from './db';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Required'),
  password: z.string().min(6, 'Password too short'),
});

interface DBUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'user';
  active: number;
  is_premium: number;
  email_verified_at: string | null;
  admin_preferences: string | null;
  failed_attempts: number;
  lock_until: string | null;
}

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await queryOne<DBUser>(
          'SELECT id, name, email, password_hash, role, active, is_premium, email_verified_at, admin_preferences, failed_attempts, lock_until FROM users WHERE email = ? LIMIT 1',
          [parsed.data.email.toLowerCase()]
        );

        if (!user) return null;

        // Check for lockout
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
          const waitMinutes = Math.ceil((new Date(user.lock_until).getTime() - new Date().getTime()) / 60000);
          throw new Error(`Account locked due to too many failed attempts. Please try again in ${waitMinutes} minutes.`);
        }

        if (!user.active || !user.email_verified_at) {
          throw new Error('Please verify your email before logging in.');
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
        
        if (!valid) {
          // Increment failed attempts
          const newAttempts = user.failed_attempts + 1;
          let lockUntil = null;
          
          if (newAttempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60000); // 15 minutes lockout
          }

          await queryOne('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?', [newAttempts, lockUntil, user.id]);
          
          if (lockUntil) {
            throw new Error('Too many failed attempts. Account locked for 15 minutes.');
          }
          return null;
        }

        // Success: Reset security counters and record login
        queryOne('UPDATE users SET last_login = NOW(), failed_attempts = 0, lock_until = NULL WHERE id = ?', [user.id]).catch(() => null);

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          is_premium: user.is_premium === 1,
          admin_preferences: user.admin_preferences ? JSON.parse(user.admin_preferences) : null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        // Check if user exists
        const dbUser = await queryOne<DBUser>(
          'SELECT id, role, active FROM users WHERE email = ? LIMIT 1',
          [email]
        );

        if (!dbUser) {
          // Auto-register Google user
          await execute(
            'INSERT INTO users (name, email, image, role, active, email_verified_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [user.name || 'Google User', email, user.image || null, 'user', 1]
          );
        } else {
          // Optionally update their image if it changed
          if (user.image) {
            await execute('UPDATE users SET image = ? WHERE id = ?', [user.image, dbUser.id]);
          }
        }
      }
      return true;
    },
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

export const getSession = () => getServerSession(authOptions);
export const requireAdmin = async () => {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') return null;
  return session;
};

export const requireManager = async () => {
  const session = await getSession();
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) return null;
  return session;
};
