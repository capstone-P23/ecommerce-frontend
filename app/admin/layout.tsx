import type { ReactNode } from 'react';

import { AdminSidebar } from '@/components/layout/admin-sidebar';

/**
 * 관리자 영역 L-Type 레이아웃 (Sidebar + Main).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
    </div>
  );
}
