import type { ReactNode } from 'react';

interface AccountSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function AccountSectionHeader({ eyebrow, title, description, action }: AccountSectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{eyebrow}</p>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
