import React from 'react';
import Link from 'next/link';

export default function Pagecheckoutsuccess() {
  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <main className="max-w-4xl w-full px-6 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Visual */}
            <div className="bg-slate-900 relative flex flex-col items-center justify-center p-12 min-h-[300px]">
              <div className="absolute inset-0 opacity-40">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNwgsX42lORH3wFhJCm7r5qcpnCskcX2PMR76SNRYuNdymcQ402YScBghT2GAzJwQwuG0AYCS3TPybL0ckV3rsE5-g7eJYjMmE3UJpdhDLRElfyJwI4sYxRzCM1plu9GEIIysaLJI1XGTxDv5J2HvW6v6Mez43KkfiAG8Y18TA8uQTgFZpMbTxc868_ZpIO3o48w-38IsoXQfE42GC2_yzfaXOfvVGBnUDlnHafAZx-KmwEzu4YRBV5_8hgC2v-_073CwrUoHJ-BA" alt="Ocean" />
                <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 to-slate-950" />
              </div>
              
              <div className="relative z-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 rounded-full bg-sky-600 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sky-600/50">
                   <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight italic mb-2">Curation Initialized</h2>
                <p className="text-sky-200/60 text-xs font-bold uppercase tracking-widest">Order #DS-82941-SEA</p>
              </div>
            </div>

            {/* Right: Content */}
            <div className="p-12 flex flex-col justify-center">
              <header className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 mb-2 block">Success Selection</span>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">Thank you for supporting <br/>Maritime Craftsmanship.</h1>
              </header>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">October 24 - 26, 2024</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Your selection of artisanal coastal goods is being prepared with clinical precision. A confirmation dispatch has been sent to your harbor contact.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1">
                  <button className="w-full py-3.5 bg-slate-900 dark:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                    Return to Coast
                  </button>
                </Link>
                <Link href="/orders" className="flex-1">
                  <button className="w-full py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Track Curation
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
