'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Image, Users, LogOut, ExternalLink, Cpu, Wrench } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/admin',                label: 'Dashboard',    icon: LayoutDashboard, adminOnly: false },
  { href: '/admin/gallery',        label: 'Gallery',      icon: Image,           adminOnly: false },
  { href: '/admin/gallery-tools',  label: 'Gallery Tools',icon: Wrench,          adminOnly: false },
  { href: '/admin/users',          label: 'Users',        icon: Users,           adminOnly: true  },
  { href: '/admin/ai-usage',       label: 'AI Usage',     icon: Cpu,             adminOnly: true  },
];

export default function AdminSidebar() {
  const pathname  = usePathname();
  const { data }  = useSession();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-[#0A0A0A] border-r border-gold/10 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gold/10">
        <div className="font-display text-base tracking-[0.2em] uppercase text-white">Dubai Mall</div>
        <div className="text-[8px] tracking-[0.5em] uppercase text-gold font-sans mt-0.5">Admin Portal</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && data?.user?.role !== 'admin') return null;

          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans transition-all',
                active
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gold/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-white/30 hover:text-white/60 transition-colors font-sans"
        >
          <ExternalLink size={14} />
          View Site
        </Link>
        {data?.user && (
          <div className="px-3 py-2 mb-1">
            <div className="text-[10px] text-white/20 font-sans truncate">{data.user.email}</div>
            <div className="text-[9px] tracking-widest uppercase text-gold/50 font-sans mt-0.5">
              {data.user.role}
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
