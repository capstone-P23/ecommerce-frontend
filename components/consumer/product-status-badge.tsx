import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/types/api';

/**
 * 상품 상태 시각 표시.
 * ACTIVE = badge 생략 (정상 판매 상태는 노이즈)
 * SOLD_OUT / DISCONTINUED = 색상으로 명시
 */
type Props = {
  status: ProductStatus;
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  DISCONTINUED: '판매 중지',
};

export function ProductStatusBadge({ status }: Props) {
  // 정상 판매 상태는 강조 안 함 (시각 노이즈 줄임)
  if (status === 'ACTIVE') return null;

  const variant = status === 'SOLD_OUT' ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}
