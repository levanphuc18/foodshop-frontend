import React from 'react';
import Link from 'next/link';

export default function Pagenotfound() {
  return (
    <main className="min-h-screen pt-32 pb-40 px-10 max-w-7xl mx-auto bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0">
        <h1 className="text-[20rem] md:text-[30rem] font-black tracking-tighter text-slate-950 dark:text-white leading-none opacity-[0.03] select-none">404</h1>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <span className="text-sky-600 font-black tracking-[0.4em] text-[10px] uppercase mb-8 block italic">Manifest Lost at Sea</span>
        
        <h2 className="text-6xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tighter mb-8 leading-none">Charted Territory <br /> Ends Here.</h2>
        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
          The artisanal curation you're searching for has either been reclaimed by the tides or never left the harbor.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/" className="px-12 py-6 bg-slate-950 dark:bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Return to Safe Harbor
          </Link>
          <Link href="/products" className="px-12 py-6 bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">
            Explore Collections
          </Link>
        </div>
      </div>

      <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl text-left relative z-10">
        <SuggestionCard icon="inventory_2" title="Curation Vault" desc="Discover our hand-picked selection of maritime treasures." href="/products" />
        <SuggestionCard icon="history" title="Logistics Tracker" desc="Check the status of your current vessel shipments." href="/orders" />
        <SuggestionCard icon="contact_support" title="Master Curators" desc="Need assistance? Our team is standing by to help." href="/" />
      </div>

      <div className="mt-40 pt-10 border-t border-slate-100 dark:border-slate-800 w-full text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          © 2024 DrySea. All rights reserved.
        </p>
      </div>
    </main>
  );
}

function SuggestionCard({ icon, title, desc, href }: any) {
  return (
    <Link href={href} className="group p-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-sky-500 transition-all">
      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-sky-600 group-hover:text-white transition-all">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h4 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-3 uppercase">{title}</h4>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </Link>
  );
}
