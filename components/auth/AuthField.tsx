import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightSlot?: ReactNode;
}

export default function AuthField({ label, rightSlot, className = '', ...props }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</label>
        {rightSlot}
      </div>
      <input
        className={`w-full px-5 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
}
