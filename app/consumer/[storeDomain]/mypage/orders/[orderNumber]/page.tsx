import { notFound } from 'next/navigation';

import { OrderDetailView } from '@/components/consumer/order-detail-view';

// [ORD-003, ORD-004] 주문 상세 + 취소
export default async function ConsumerMyOrderDetailPage({
  params,
}: {
  params: Promise<{ storeDomain: string; orderNumber: string }>;
}) {
  const { storeDomain, orderNumber } = await params;
  if (!orderNumber) notFound();
  return <OrderDetailView orderNumber={orderNumber} storeDomain={storeDomain} />;
}
