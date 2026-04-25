'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProfileSidebarProps {
  active: string;
}

export default function ProfileSidebar({ active }: ProfileSidebarProps) {
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  const links = [
    { href: '/profile', icon: 'account_circle', label: 'Account Details', key: 'profile' },
    { href: '/orders', icon: 'package_2', label: 'Order History', key: 'orders' },
    { href: '/wishlist', icon: 'favorite', label: 'Saved Items', key: 'wishlist' },
    { href: '/address', icon: 'local_shipping', label: 'Addresses', key: 'address' },
    { href: '/payment', icon: 'credit_card', label: 'Payment Methods', key: 'payment' },
  ];

  return (
    <aside className="w-72 hidden lg:flex flex-col py-10 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      <div className="px-8 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white text-xs font-black">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.username || 'User'}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Elite Member</p>
          </div>
        </div>
      </div>

      <p className="px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Account</p>
      <nav className="flex flex-col px-4 space-y-0.5">
        {links.map(({ href, icon, label, key }) => {
          const isActive = active === key;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-['Inter']"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
