import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col bg-surface min-h-screen">
        {children}
      </div>
    </div>
  );
}
