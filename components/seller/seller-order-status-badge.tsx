import { Badge } from '@/components/ui/badge';
import type { SellerOrderStatus } from '@/types/api';

const LABEL: Record<SellerOrderStatus, string> = {
  PAID: '결제 완료',
  PREPARING: '상품 준비',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소',
};

const VARIANT: Record<SellerOrderStatus, 'default' | 'secondary' | 'destructive'> = {
  PAID: 'default',
  PREPARING: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'secondary',
  CANCELLED: 'destructive',
};

export function SellerOrderStatusBadge({ status }: { status: SellerOrderStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
