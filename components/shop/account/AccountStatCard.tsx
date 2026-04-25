interface AccountStatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

export default function AccountStatCard({ icon, label, value, color }: AccountStatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </div>
  );
}
