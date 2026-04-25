import type { ReactNode } from 'react';
import ProfileSidebar from './ProfileSidebar';

interface AccountPageShellProps {
  active: string;
  children: ReactNode;
}

export default function AccountPageShell({ active, children }: AccountPageShellProps) {
  return (
    <div className="flex min-h-screen pt-20 bg-slate-50 dark:bg-slate-950">
      <ProfileSidebar active={active} />
      <section className="flex-1 overflow-y-auto">{children}</section>
    </div>
  );
}
