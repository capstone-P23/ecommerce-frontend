'use client';

import Link from 'next/link';

import { ComingSoonSection } from '@/components/consumer/coming-soon-section';

type Props = {
  orderId: string;
};

export function SellerOrderDetailView({ orderId }: Props) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <Link
          href="/seller/orders"
          className="text-sm text-muted-foreground hover:underline"
        >
          주문 목록
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-2xl font-bold">{orderId}</h1>
        </div>
      </header>
      <ComingSoonSection title="주문 상세" plannedPhase="백엔드 구현 후" />
    </article>
  );
}
