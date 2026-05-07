import type { ReactNode } from 'react';

import { TopNavigation } from '@/components/layout/top-navigation';
import { FloatingAIChat } from '@/components/layout/floating-ai-chat';

/**
 * 소비자 영역 Top-Down 레이아웃 (TopNavigation + Main + FloatingAIChat).
 */
export default async function ConsumerStoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavigation storeDomain={storeDomain} />
      <main className="mx-auto w-full max-w-7xl flex-1 p-6">{children}</main>
      <FloatingAIChat />
    </div>
  );
}
