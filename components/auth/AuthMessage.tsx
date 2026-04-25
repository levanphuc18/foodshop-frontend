import type { ReactNode } from 'react';

interface AuthMessageProps {
  variant: 'error' | 'success';
  children: ReactNode;
}

export default function AuthMessage({ variant, children }: AuthMessageProps) {
  const styles =
    variant === 'error'
      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';

  return <div className={`mb-6 p-3 text-sm rounded-xl border ${styles}`}>{children}</div>;
}
