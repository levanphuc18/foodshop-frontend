import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightSlot?: ReactNode;
  error?: string;
}

export default function AuthField({
  label,
  rightSlot,
  error,
  className = '',
  ...props
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        className={`w-full px-5 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 ${
          error ? 'ring-2 ring-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="ml-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
