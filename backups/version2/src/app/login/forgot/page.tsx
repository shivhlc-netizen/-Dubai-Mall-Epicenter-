'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import TeddyGuide from '@/components/ui/TeddyGuide';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [teddyState, setTeddyState] = useState<'neutral' | 'typing' | 'success' | 'error'>('neutral');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(data.message);
        setTeddyState('success');
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

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="text-center mb-8">
          <TeddyGuide state={teddyState} />
        </div>

        <div className="glass-card rounded-sm p-8 border-gold/10">
          <h1 className="font-display text-xl text-white mb-2">Password Recovery</h1>
          <p className="text-white/30 text-xs font-sans mb-8 leading-relaxed">
            Enter your corporate email address to receive a secure reset link.
          </p>

          <AnimatePresence mode="wait">
            {message ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 p-4 rounded-sm mb-6 flex items-start gap-3"
              >
                <CheckCircle2 size={16} className="text-green-400 mt-0.5" />
                <p className="text-xs text-green-200/80 leading-relaxed font-sans">{message}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-sm flex items-center gap-2 text-red-400 text-xs font-sans">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans">Corporate Email</label>
                  <div className="relative group">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (teddyState !== 'typing') setTeddyState('typing');
                      }}
                      className="w-full bg-white/5 border border-gold/15 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-gold/40 transition-all font-sans"
                      placeholder="name@dubaimall.ae"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-all font-sans">
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
