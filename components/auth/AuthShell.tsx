import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
  subtitle: string;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

export default function AuthShell({
  children,
  subtitle,
  footer,
  maxWidthClassName = 'max-w-[440px]',
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-['Inter']">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <main className={`w-full ${maxWidthClassName} px-6 z-10 py-12`}>
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black tracking-tighter text-sky-950 dark:text-white mb-2 italic inline-block">
            <span className="text-sky-600">Dry</span>Sea
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">{subtitle}</p>
        </div>

        {children}

        <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest">
          © 2024 DrySea. All Rights Reserved.
        </p>
        {footer}
      </main>
    </div>
  );
}
