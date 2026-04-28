'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/layout/NotificationBell';

import { useRouter } from 'next/navigation';

export default function Header() {
  const { itemCount, fetchCart } = useCart();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Fix hydration mismatch for auth state
  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh(); // Refresh context like middleware
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-100/50 dark:border-slate-800/50">
      <div className="flex justify-between items-center w-full px-10 h-20 max-w-[1600px] mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group italic flex items-center gap-1">
          <span className="text-sky-600 group-hover:text-sky-500 transition-colors">Dry</span>Sea
        </Link>
        
        <div className="hidden lg:flex items-center space-x-10">
          <NavLink href="/products" label="Shop All" active />
          <NavLink href="/" label="Premium Reserve" />
          <NavLink href="/" label="Our Process" />
          <NavLink href="/admin/dashboard" label="Admin Portal" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <HeaderIcon href="/cart" icon="shopping_cart" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm animate-in zoom-in duration-300">
                {itemCount}
              </span>
            )}
          </div>

          {isAuthenticated && user?.role === 'CUSTOMER' && <NotificationBell />}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-black text-[10px] uppercase border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-all">
                  {user?.username?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                    {user?.username}
                  </p>
                  <p className="text-[9px] font-black text-sky-600 dark:text-sky-300 uppercase tracking-widest mt-0.5">
                    {user?.role ?? 'CUSTOMER'}
                  </p>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="px-5 py-2 bg-slate-900 dark:bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-slate-900/10 dark:shadow-sky-900/20">
                Login
              </button>
            </Link>
          )}

          <button className="md:hidden p-2 text-slate-600">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`text-[13px] font-black uppercase tracking-[0.15em] transition-all hover:text-sky-600 ${
        active ? 'text-sky-600' : 'text-slate-600 dark:text-slate-300'
      }`}
    >
      {label}
    </Link>
  );
}

function HeaderIcon({ href, icon }: { href: string; icon: string }) {
  return (
    <Link href={href}>
      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all active:scale-90">
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </button>
    </Link>
  );
}
