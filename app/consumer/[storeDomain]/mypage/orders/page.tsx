import { OrderListView } from '@/components/consumer/order-list-view';

// [MEM-003, ORD-003] 내 주문 목록
export default async function ConsumerMyOrdersPage({
  params,
}: {
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;
  return <OrderListView storeDomain={storeDomain} />;
}
