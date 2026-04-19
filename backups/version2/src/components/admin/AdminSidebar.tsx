'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Activity, ExternalLink, LogOut, UploadCloud } from 'lucide-react';
import clsx from 'clsx';
import { ADMIN_CATEGORIES } from '@/lib/menu-links';

export default function AdminSidebar() {
  const pathname  = usePathname();
  const { data }  = useSession();
  const userRole = data?.user?.role || 'user';
  const [budget, setBudget] = useState<{ remaining: number; total: number } | null>(null);

  useEffect(() => {
    if (data?.user) {
      fetch('/api/users/me/budget')
        .then(r => r.json())
        .then(d => setBudget({ remaining: d.remaining, total: d.total }))
        .catch(() => null);
    }
  }, [data]);

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] border-r border-gold/10 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gold/10">
        <div className="font-display text-base tracking-[0.2em] uppercase text-white">Dubai Mall</div>
        <div className="text-[8px] tracking-[0.5em] uppercase text-gold font-sans mt-0.5">Admin Portal</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto custom-scrollbar">
        {ADMIN_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-1">
            <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-white/30 uppercase tracking-wider">
              {category.title}
            </h3>
            {category.links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans transition-all',
                    active
                      ? 'bg-gold/10 text-gold'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gold/10 space-y-3 mt-auto flex-shrink-0 bg-black/40">
        {/* API Budget Insight */}
        {budget && (
          <div className="px-3 py-2 bg-white/2 border border-white/5 rounded-sm space-y-2">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
              <span className="text-white/30">AI Budget</span>
              <span className="text-gold font-mono">{budget.remaining.toLocaleString()} / {budget.total.toLocaleString()}</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold transition-all duration-1000" 
                style={{ width: `${(budget.remaining / (budget.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[11px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-sans"
        >
          <ExternalLink size={12} />
          Live Site
        </Link>

        <Link
          href="https://github.com/shivhlc-netizen/-Dubai-Mall-Epicenter-/actions"
          target="_blank"
          className="flex w-full items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest text-blue-400 bg-blue-900/10 border border-blue-500/20 hover:bg-blue-900/40 transition-all font-sans font-bold"
        >
          <Activity size={14} />
          Monitor 7-Star Build
        </Link>

        {/* Secure Netlify Push Trigger (Admin only) */}
        {data?.user?.role === 'admin' && (
          <button
            onClick={async () => {
              if (!confirm('Trigger a full site rebuild on Netlify?')) return;
              const btn = document.getElementById('push-trigger');
              const oldText = btn?.innerText || 'Push to Netlify';
              if (btn) btn.innerText = 'Triggering...';
              try {
                const res = await fetch('/api/admin/deploy', { method: 'POST' });
                const d = await res.json();
                if (res.ok) alert('🚀 Netlify Build Triggered!');
                else alert('❌ Push Failed: ' + (d.message || d.error));
              } catch (e) {
                alert('❌ Connection Error. Check Build Hook Config.');
              } finally {
                if (btn) btn.innerText = oldText;
              }
            }}
            id="push-trigger"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest text-gold bg-gold/5 border border-gold/20 hover:bg-gold hover:text-black transition-all font-sans font-bold"
          >
            <UploadCloud size={14} />
            Push to Netlify
          </button>
        )}

        {data?.user && (
          <div className="px-3 py-1">
            <div className="text-[10px] text-white/20 font-sans truncate">{data.user.email}</div>
            <div className="text-[9px] tracking-widest uppercase text-gold/50 font-sans mt-0.5">
              Access: {data.user.role}
            </div>
          </div>
        )}
        
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-red-400/60 hover:text-red-400 hover:bg-red-950/30 transition-colors font-sans"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
