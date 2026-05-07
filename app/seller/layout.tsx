import type { ReactNode } from 'react';

import { SellerSidebar } from '@/components/layout/seller-sidebar';

/**
 * 판매자 영역 L-Type 레이아웃 (Sidebar + Main).
 */
export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
    </div>
  );
}
