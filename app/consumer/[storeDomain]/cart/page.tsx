import { CartView } from '@/components/consumer/cart-view';

// [ORD-001] 장바구니
export default async function ConsumerCartPage({
  params,
}: {
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;
  return <CartView storeDomain={storeDomain} />;
}
