import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{eyebrow}</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
