'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/orders', icon: 'receipt_long', label: 'Orders' },
  { href: '/admin/products', icon: 'inventory_2', label: 'Inventory' },
  { href: '/admin/customers', icon: 'analytics', label: 'Customers' },
  { href: '/admin/discounts', icon: 'sell', label: 'Discounts' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed left-0 top-0 z-50">
      <div className="p-8">
        <Link href="/" className="text-xl font-black tracking-tighter text-sky-950 dark:text-white block mb-1 italic">
          <span className="text-sky-600">Dry</span>Sea
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">Admin Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-sky-600'
                }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-sky-900 dark:bg-sky-600 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate">Admin Manager</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black">Superuser</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
