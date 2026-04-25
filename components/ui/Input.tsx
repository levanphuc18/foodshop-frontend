import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-on-surface">{label}</label>}
      <input
        className={`px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-on-surface-variant ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
