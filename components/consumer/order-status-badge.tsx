import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/api';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '주문 완료',
  CANCELLED: '취소됨',
};

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'default',
  CANCELLED: 'destructive',
};

type Props = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: Props) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
