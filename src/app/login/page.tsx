'use client';
import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TeddyGuide, { TeddyState } from '@/components/ui/TeddyGuide';

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const { data: session, status } = useSession();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [teddyState, setTeddyState] = useState<TeddyState>('neutral');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      setTeddyState('success');
      setTimeout(() => router.replace('/admin'), 1000);
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('You do not have permission to access that page.');
      setTeddyState('error');
    }
  }, [searchParams]);

  // Update Teddy State based on input
  useEffect(() => {
    if (focusedField === 'password') {
      setTeddyState('covering-eyes');
    } else if (email) {
      setTeddyState('typing');
    } else {
      setTeddyState('neutral');
    }
  }, [email, focusedField]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    // Edge-case handling: Empty fields
    if (!email.trim()) {
      setError('Please enter your email or username.');
      setTeddyState('error');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      setTeddyState('error');
      return;
    }

    setLoading(true);

    let finalEmail = email.trim().toLowerCase();
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail.replace(/\s/g, '')}@dubaimall.ae`;
    }

    try {
      const result = await signIn('credentials', {
        email: finalEmail,
        password,
        redirect: false,
      });

      setLoading(false);
      if (result?.ok) {
        setTeddyState('success');
        router.replace('/admin');
      } else {
        setTeddyState('error');
        
        // Edge-case handling: Rate-limit and Network/Server errors
        if (result?.status === 429) {
          setError('Too many sign-in attempts. Please wait 60 seconds before trying again.');
        } else if (result?.status && result.status >= 500) {
          setError('We’re experiencing technical issues. Please try again later.');
        } else {
          setError('Invalid email or password. Please check your credentials or contact IT support if the issue persists.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('We’re experiencing technical issues. Please try again later.');
      setTeddyState('error');
    }
  }

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,160,82,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 grid-overlay opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Teddy Guide */}
        <div className="text-center mb-6">
          <TeddyGuide 
            state={teddyState} 
            lookAt={focusedField === 'email' ? { x: 0, y: 1 } : null}
          />
        </div>

        {/* Card */}
        <div className="glass-card rounded-sm p-8">
          <h1 className="font-display text-xl text-white mb-1">
            The Dubai Mall – Management Portal
          </h1>
          <p className="text-white/30 text-xs font-sans mb-8 leading-relaxed">
            Authorised personnel only. Use your registered corporate email or username.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-950/40 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-sm mb-6 flex items-center gap-2"
              >
                <AlertCircle size={14} />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-2">
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-gold/15 text-white text-sm px-4 py-3 rounded-sm
                           focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-colors"
                placeholder="shiv or you@dubaimall.ae"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans">
                  Password
                </label>
                <Link href="/login/forgot" className="text-[10px] text-gold/60 hover:text-gold transition-colors font-sans">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-gold/15 text-white text-sm px-4 py-3 pr-11 rounded-sm
                             focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0A0A0A] px-4 text-white/20 font-sans">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/admin' })}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-white/10 transition-all rounded-sm group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.76 1.85-1.61 2.41v2.77h2.61c1.53-1.41 2.4-3.48 2.4-5.69z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.61-2.77c-.72.48-1.63.77-2.67.77-2.83 0-5.22-1.91-6.07-4.48H3.34v2.84C5.15 20.21 8.35 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.93 13.86c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.84H3.34C2.58 8.41 2.15 10.16 2.15 12s.43 3.59 1.19 5.16l2.6-2.09c-.21-.66-.35-1.36-.35-2.09z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.35 1 5.15 3.79 3.34 6.84l2.59 2.09c.85-2.57 3.24-4.48 6.07-4.48z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center mt-6 text-xs text-white/30">
            Don't have an account? {' '}
            <Link href="/signup" className="text-gold hover:underline">Create an account</Link>
          </p>

          {/* Quick Access Modes */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <p className="text-[9px] tracking-[0.4em] uppercase text-white/20 text-center mb-4 font-sans">Corporate Quick Access</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => { setEmail('admin@dubaimall.ae'); setPassword('S#iv2026'); }}
                className="w-full py-2 bg-gold/5 border border-gold/10 text-gold/60 text-[9px] tracking-widest uppercase hover:bg-gold hover:text-black transition-all rounded-sm"
              >
                1. Admin Mode
              </button>
              <button
                onClick={() => { setEmail('hlc@dubaimall.ae'); setPassword('HLC2026'); }}
                className="w-full py-2 bg-white/5 border border-white/10 text-white/40 text-[9px] tracking-widest uppercase hover:bg-white/20 hover:text-white transition-all rounded-sm"
              >
                2. HLC Mode
              </button>
              <button
                onClick={() => { setEmail('shivshambhu@dubaimall.ae'); setPassword('Premium2026'); }}
                className="w-full py-2 bg-blue-500/5 border border-blue-500/10 text-blue-400/60 text-[9px] tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all rounded-sm"
              >
                3. Shiv Shambhu Premium
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-white/15 text-[10px] font-sans mt-6">
          Secured with NextAuth · bcrypt · Rate limited
        </p>
      </motion.div>
    </div>
  );
}
