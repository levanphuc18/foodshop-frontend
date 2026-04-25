import type { FilterGroupProps } from './types';

export default function FilterGroup({ title, isOpen, onToggle, children }: FilterGroupProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        {title}
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {isOpen ? <div className="px-2 pb-2 space-y-0.5">{children}</div> : null}
    </div>
  );
}
