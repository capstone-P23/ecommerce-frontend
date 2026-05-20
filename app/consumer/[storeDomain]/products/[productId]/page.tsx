import { notFound } from 'next/navigation';

import { ProductDetailView } from '@/components/consumer/product-detail-view';

// [PRD-004] 상품 상세 — 리뷰/Q&A 는 백엔드 미구현, ComingSoonSection 으로 표시
export default async function ConsumerProductDetailPage({
  params,
}: {
  params: Promise<{ storeDomain: string; productId: string }>;
}) {
  const { storeDomain, productId } = await params;
  const numericId = Number(productId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  return <ProductDetailView productId={numericId} storeDomain={storeDomain} />;
}
