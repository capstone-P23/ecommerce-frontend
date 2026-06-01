'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminSellerApplications,
  useApproveSellerApplication,
  useRejectSellerApplication,
} from '@/lib/queries/admin';
import type {
  SellerApplicationAdmin,
  SellerApplicationStatus,
} from '@/types/api';

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

export function AdminSellersView() {
  const { data, isLoading } = useAdminSellerApplications();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = data ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">판매자 관리</h1>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">신청 ID</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((seller) => (
                  <SellerRow key={seller.applicationId} seller={seller} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SellerRow({ seller }: { seller: SellerApplicationAdmin }) {
  const approveMutation = useApproveSellerApplication();
  const rejectMutation = useRejectSellerApplication();
  const [reason, setReason] = useState('');

  const handleApprove = () => {
    approveMutation.mutate(seller.applicationId, {
      onSuccess: () => toast.success('승인 완료'),
      onError: (e) => toast.error(`실패: ${e.message}`),
    });
  };

  const handleReject = () => {
    const message = reason.trim();
    if (!message) return;
    rejectMutation.mutate(
      { applicationId: seller.applicationId, reason: message },
      {
        onSuccess: () => {
          toast.success('반려 처리됨');
          setReason('');
        },
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 font-mono text-xs">{seller.applicationId}</td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_VARIANT[seller.status]}>
          {STATUS_LABEL[seller.status]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          {seller.status !== 'APPROVED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              승인
            </Button>
          )}
          {seller.status !== 'REJECTED' && (
            <div className="flex items-center gap-2">
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="반려 사유"
                className="h-7 w-36"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !reason.trim()}
              >
                반려
              </Button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
