import { notFound } from 'next/navigation';

import { AdminProductDetailView } from '@/components/admin/admin-product-detail-view';

// Admin 상품 상세 + 수정 + SKU 관리 + 재고 ± (phase 7a)
export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isFinite(numeric) || numeric <= 0) notFound();
  return <AdminProductDetailView productId={numeric} />;
}
