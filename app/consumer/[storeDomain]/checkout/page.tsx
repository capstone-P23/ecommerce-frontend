import { CheckoutView } from '@/components/consumer/checkout-view';

// [ORD-002, PAY-001, PAY-002] 주문 / 결제
export default async function ConsumerCheckoutPage({
  params,
}: {
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;
  return <CheckoutView storeDomain={storeDomain} />;
}
