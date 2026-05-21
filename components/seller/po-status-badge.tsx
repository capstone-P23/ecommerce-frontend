import { Badge } from '@/components/ui/badge';
import type { PurchaseOrderStatus } from '@/types/api';

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  REQUESTED: '발주 요청',
  RECEIVED: '입고 완료',
  CANCELLED: '취소',
};

const STATUS_VARIANT: Record<
  PurchaseOrderStatus,
  'default' | 'secondary' | 'destructive'
> = {
  REQUESTED: 'default',
  RECEIVED: 'secondary',
  CANCELLED: 'destructive',
};

type Props = {
  status: PurchaseOrderStatus;
};

export function PoStatusBadge({ status }: Props) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
