import { notFound } from 'next/navigation';

import { SellerOrderDetailView } from '@/components/seller/seller-order-detail-view';

// [SEL-ORD-002] 주문 상세 + 송장 입력 (mock)
// 동적 segment 이름은 [orderId] 로 유지하되, 실제로는 orderNumber 형식
// (백엔드 컨벤션 정렬 시 segment 이름 함께 변경)
export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!orderId) notFound();
  return <SellerOrderDetailView orderId={orderId} />;
}
