'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const e = searchParams.get('email');
    if (e) setEmail(e);
  }, [searchParams]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setVerified(true);
      setTimeout(() => router.push('/login?message=Verified successfully'), 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md relative z-10"
    >
      <div className="text-center mb-10">
        <div className="inline-block mb-6">
          <div className="bg-gold/10 p-4 rounded-full text-gold">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h1 className="font-display text-3xl text-white mb-2">Verify Your Access</h1>
        <p className="text-white/40 text-sm">Enter the 6-digit code sent to your email</p>
      </div>

      <div className="glass-card p-8 rounded-sm border-gold/10">
        {verified ? (
          <div className="text-center py-4">
            <div className="text-gold text-lg mb-2 font-display">Identity Confirmed</div>
            <p className="text-white/40 text-xs">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1.5">Email Address</label>
              <input
                disabled
                type="email"
                value={email}
                className="w-full bg-white/5 border border-white/10 text-white/50 text-sm px-4 py-3 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1.5">6-Digit Code</label>
              <input
                required
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/5 border border-white/10 text-white text-2xl tracking-[0.5em] text-center px-4 py-4 focus:outline-none focus:border-gold/40 transition-colors font-mono"
                placeholder="000000"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || code.length !== 6}
              className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Account'}
              {!loading && <ArrowRight size={14} />}
            </button>
            
            <div className="text-center">
               <Link href="/signup" className="text-[10px] text-white/20 hover:text-gold uppercase tracking-widest">Back to Signup</Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
      </div>
      <Suspense fallback={<Loader2 className="animate-spin text-gold" />}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
