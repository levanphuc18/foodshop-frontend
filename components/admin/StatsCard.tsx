interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  trendUp?: boolean;
  toneClassName?: string;
}

export default function StatsCard({
  icon,
  label,
  value,
  sub,
  trendUp,
  toneClassName = 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClassName}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trendUp !== undefined ? (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
              trendUp
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
            {trendUp ? 'UP' : 'DOWN'}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{label}</p>
      {sub ? <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-black">{sub}</p> : null}
    </div>
  );
}
