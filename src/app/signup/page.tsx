'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import TeddyGuide, { TeddyState } from '@/components/ui/TeddyGuide';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', consent: false });
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', consent: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [teddyState, setTeddyState] = useState<TeddyState>('neutral');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real-time validation effect
  useEffect(() => {
    const errors = { name: '', email: '', password: '', consent: '' };
    let hasError = false;

    if (formData.name && formData.name.length < 2) {
      errors.name = 'Name is a bit too short.';
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email) && formData.email.includes('@')) {
      errors.email = 'This email looks incomplete.';
      hasError = true;
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Security requires at least 6 characters.';
      hasError = true;
    } else if (formData.password && !/[0-9]/.test(formData.password)) {
      errors.password = 'Suggestion: Add a number for better security.';
      // We don't mark hasError = true for suggestions unless we want to block
    }

    setFieldErrors(errors);

    // Update Teddy State
    if (focusedField === 'password') {
      setTeddyState('covering-eyes');
    } else if (hasError) {
      setTeddyState('error');
    } else if (formData.name || formData.email || formData.password) {
      setTeddyState('typing');
    } else {
      setTeddyState('neutral');
    }
  }, [formData, focusedField]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    // Final validation check
    if (fieldErrors.name || (fieldErrors.email && !formData.email.endsWith('@dubaimall.ae')) || (fieldErrors.password && formData.password.length < 6)) {
      setTeddyState('error');
      return;
    }

    setLoading(true);

    try {
      let finalEmail = formData.email;
      if (!finalEmail.includes('@')) {
        finalEmail = `${finalEmail.toLowerCase().replace(/\s/g, '')}@dubaimall.ae`;
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: finalEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Try logging in!' }));
          setTeddyState('error');
          throw new Error('Email already exists.');
        }
        throw new Error(data.error || 'Signup failed');
      }

      setTeddyState('success');
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(finalEmail)}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <TeddyGuide 
            state={teddyState} 
            lookAt={focusedField === 'name' ? {x: -1, y: 1} : focusedField === 'email' ? {x: 0, y: 1} : null}
          />
          <h1 className="font-display text-3xl text-white mb-2">Join the Epicenter</h1>
          <p className="text-white/40 text-sm">Experience the world's 7-star retail destination</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-sm border-gold/10 relative overflow-hidden">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 mb-6 rounded-sm flex items-center gap-2"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <div className="relative">
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1.5">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-white/5 border ${fieldErrors.name ? 'border-red-500/50' : 'border-white/10'} text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors`}
                placeholder="John Doe"
              />
              {fieldErrors.name && <p className="text-[9px] text-red-400 mt-1">{fieldErrors.name}</p>}
            </div>

            <div className="relative">
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1.5">Email / Username</label>
              <input
                required
                type="text"
                value={formData.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10'} text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors`}
                placeholder="shiv or you@example.com"
              />
              {fieldErrors.email ? (
                <p className="text-[9px] text-red-400 mt-1">{fieldErrors.email}</p>
              ) : (
                <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">If no domain provided, @dubaimall.ae will be added</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1.5">Password</label>
              <input
                required
                type="password"
                value={formData.password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={`w-full bg-white/5 border ${fieldErrors.password && formData.password.length < 6 ? 'border-red-500/50' : formData.password.length >= 6 ? 'border-green-500/30' : 'border-white/10'} text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors`}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className={`text-[9px] mt-1 ${formData.password.length < 6 ? 'text-red-400' : 'text-gold/60 italic'}`}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input
                id="consent"
                type="checkbox"
                required
                checked={formData.consent}
                onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-1 accent-gold"
              />
              <label htmlFor="consent" className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter cursor-pointer">
                I give permission to store my name and profile picture as required by industry standards and privacy policies.
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-gold mt-8 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                <span>Create Account</span>
                <ArrowRight size={14} />
              </>
            )}
            {teddyState === 'success' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-green-600 flex items-center justify-center"
              >
                <CheckCircle2 size={20} />
              </motion.div>
            )}
          </button>

          <p className="text-center mt-6 text-xs text-white/30">
            Already have an account? {' '}
            <Link href="/login" className="text-gold hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
