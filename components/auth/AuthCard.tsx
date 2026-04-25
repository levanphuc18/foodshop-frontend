import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] border border-white dark:border-slate-800 shadow-2xl shadow-sky-900/5">
      {children}
    </div>
  );
}
