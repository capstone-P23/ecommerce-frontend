'use client';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminSellers,
  useSetSellerGrade,
  useSetSellerStatus,
} from '@/lib/queries/admin-mock';
import type {
  SellerApplication,
  SellerApplicationStatus,
  SellerGrade,
} from '@/types/api';

import { AdminMockNotice } from './admin-mock-notice';

const STATUS_LABEL: Record<SellerApplicationStatus, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const STATUS_VARIANT: Record<
  SellerApplicationStatus,
  'default' | 'secondary' | 'destructive'
> = {
  PENDING: 'default',
  APPROVED: 'secondary',
  REJECTED: 'destructive',
};

const GRADE_OPTIONS: SellerGrade[] = ['BRONZE', 'SILVER', 'GOLD'];

export function AdminSellersView() {
  const { data, isLoading } = useAdminSellers();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = data ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">판매자 관리</h1>
        <AdminMockNotice />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">브랜드</th>
                  <th className="px-4 py-2.5">대표자</th>
                  <th className="px-4 py-2.5">이메일</th>
                  <th className="px-4 py-2.5">신청일</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5">등급</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((seller) => (
                  <SellerRow key={seller.id} seller={seller} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SellerRow({ seller }: { seller: SellerApplication }) {
  const statusMutation = useSetSellerStatus();
  const gradeMutation = useSetSellerGrade();

  const changeStatus = (status: SellerApplicationStatus) => {
    statusMutation.mutate(
      { id: seller.id, status },
      {
        onSuccess: () => toast.success(`상태 → ${STATUS_LABEL[status]}`),
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  const changeGrade = (grade: SellerGrade) => {
    gradeMutation.mutate(
      { id: seller.id, grade },
      {
        onSuccess: () => toast.success(`등급 → ${grade}`),
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 font-mono text-xs">{seller.id}</td>
      <td className="px-4 py-3">{seller.brandName}</td>
      <td className="px-4 py-3">{seller.representativeName}</td>
      <td className="px-4 py-3 text-muted-foreground">{seller.email}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(seller.appliedAt).toLocaleDateString('ko-KR')}
      </td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_VARIANT[seller.status]}>
          {STATUS_LABEL[seller.status]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {seller.status === 'APPROVED' ? (
          <select
            value={seller.grade ?? ''}
            onChange={(e) => changeGrade(e.target.value as SellerGrade)}
            disabled={gradeMutation.isPending}
            className="h-7 rounded border border-input bg-background px-2 text-xs"
          >
            <option value="">미지정</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          {seller.status !== 'APPROVED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeStatus('APPROVED')}
              disabled={statusMutation.isPending}
            >
              승인
            </Button>
          )}
          {seller.status !== 'REJECTED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => changeStatus('REJECTED')}
              disabled={statusMutation.isPending}
            >
              반려
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
