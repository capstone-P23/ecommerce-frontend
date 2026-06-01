import { Badge } from '@/components/ui/badge';
import type { OrderAdminStatus } from '@/types/api';

const LABEL: Record<OrderAdminStatus, string> = {
  PENDING: '확정 대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
};

const VARIANT: Record<
  OrderAdminStatus,
  'default' | 'secondary' | 'destructive'
> = {
  PENDING: 'default',
  CONFIRMED: 'secondary',
  CANCELLED: 'destructive',
};

export function SellerOrderStatusBadge({
  status,
}: {
  status: OrderAdminStatus;
}) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
