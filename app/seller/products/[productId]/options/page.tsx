import { notFound } from 'next/navigation';

import { SellerProductOptionsView } from '@/components/seller/seller-product-options-view';

// [SEL-PRD-002] 상품 옵션 관리 (mock)
export default async function SellerProductOptionsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const numeric = Number(productId);
  if (!Number.isFinite(numeric) || numeric <= 0) notFound();
  return <SellerProductOptionsView productId={numeric} />;
}
