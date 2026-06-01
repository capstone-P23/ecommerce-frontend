'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import {
  useConfirmSettlement,
  useSellerSettlementSummary,
} from '@/lib/queries/seller';

export function SellerSettlementView() {
  const { data, isLoading } = useSellerSettlementSummary();
  const confirmSettlement = useConfirmSettlement();
  const [settledMonth, setSettledMonth] = useState('');

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data) return null;

  const handleConfirm = () => {
    const value = settledMonth.trim();
    if (!value) return;
    confirmSettlement.mutate(
      { settledMonth: value },
      {
        onSuccess: () => {
          toast.success('정산이 확정되었습니다.');
          setSettledMonth('');
        },
        onError: (e) => toast.error(`확정 실패: ${e.message}`),
      },
    );
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">정산</h1>
      </header>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <SummaryItem
            label="총 매출"
            value={formatPrice(data.totalSalesAmount)}
          />
          <SummaryItem label="총 수수료" value={formatPrice(data.totalFee)} />
          <SummaryItem
            label="정산 금액"
            value={formatPrice(data.totalSettlementAmount)}
          />
          <SummaryItem label="수수료율" value={`${data.feeRate * 100}%`} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">정산 확정</h2>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label>정산 월 (YYYY-MM)</Label>
              <Input
                value={settledMonth}
                onChange={(e) => setSettledMonth(e.target.value)}
                placeholder="2026-05"
              />
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!settledMonth.trim() || confirmSettlement.isPending}
            >
              확정
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">주문번호</th>
                  <th className="px-4 py-2.5">주문 금액</th>
                  <th className="px-4 py-2.5">수수료</th>
                  <th className="px-4 py-2.5">정산 금액</th>
                  <th className="px-4 py-2.5">확정일</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.orderId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(item.orderAmount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      -{formatPrice(item.fee)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(item.settlementAmount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(item.confirmedAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
