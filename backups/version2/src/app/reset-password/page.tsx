'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import TeddyGuide from '@/components/ui/TeddyGuide';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [teddyState, setTeddyState] = useState<'neutral' | 'typing' | 'success' | 'error' | 'covering-eyes'>('neutral');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      setTeddyState('error');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setTeddyState('error');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setTeddyState('error');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('Password reset successfully. Redirecting to login...');
        setTeddyState('success');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Something went wrong');
        setTeddyState('error');
      }
    } catch (err) {
      setError('Technical issues. Please try again later.');
      setTeddyState('error');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !message) {
    return (
      <div className="glass-card rounded-sm p-8 border-red-500/20 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-xl text-white mb-2">Invalid Link</h1>
        <p className="text-white/40 text-xs font-sans mb-6">This reset link is invalid or has expired.</p>
        <Link href="/login/forgot" className="btn-gold block text-center py-2">Request New Link</Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-sm p-8 border-gold/10">
      <h1 className="font-display text-xl text-white mb-2">New Password</h1>
      <p className="text-white/30 text-xs font-sans mb-8 leading-relaxed">
        Establish a new secure credential for your Management Portal access.
      </p>

      <AnimatePresence mode="wait">
        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 p-6 rounded-sm text-center"
          >
            <CheckCircle2 size={32} className="text-green-400 mx-auto mb-4" />
            <p className="text-sm text-green-200/80 font-sans mb-2">{message}</p>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-sans">Redirecting...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-sm flex items-center gap-2 text-red-400 text-xs font-sans">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans">New Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTeddyState('covering-eyes');
                    }}
                    onBlur={() => setTeddyState('neutral')}
                    className="w-full bg-white/5 border border-gold/15 text-white text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-gold/40 transition-all font-sans"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans">Confirm New Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-gold/15 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-gold/40 transition-all font-sans"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="text-center mb-8">
          <Suspense fallback={<div className="h-[120px]" />}>
            <TeddyContextWrapper />
          </Suspense>
        </div>

        <Suspense fallback={<div className="glass-card h-[300px] animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}

// Separate component to handle Teddy state which might depend on searchParams
function TeddyContextWrapper() {
  const [localState, setLocalState] = useState<'neutral' | 'typing' | 'success' | 'error' | 'covering-eyes'>('neutral');
  // In a real app we'd sync this with ResetPasswordForm's state if needed, 
  // but for simplicity here we just use it inside the form.
  // This wrapper is just to ensure Suspense context for useSearchParams inside ResetPasswordForm.
  return <TeddyGuide state="neutral" />; 
}
