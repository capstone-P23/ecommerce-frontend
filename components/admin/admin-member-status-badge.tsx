import { Badge } from '@/components/ui/badge';
import type { MemberStatus } from '@/types/api';

const LABEL: Record<MemberStatus, string> = {
  PENDING: '인증 대기',
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

const VARIANT: Record<MemberStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'default',
  ACTIVE: 'secondary',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'destructive',
};

export function AdminMemberStatusBadge({ status }: { status: MemberStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
