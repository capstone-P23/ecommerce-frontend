'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useSellerSettlements } from '@/lib/queries/seller-mock';

import { MockNotice } from './mock-notice';

export function SellerSettlementView() {
  const { data: settlements, isLoading } = useSellerSettlements();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = settlements ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">정산</h1>
        <MockNotice />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">기간</th>
                  <th className="px-4 py-2.5">총 매출</th>
                  <th className="px-4 py-2.5">수수료</th>
                  <th className="px-4 py-2.5">실 지급</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5">정산일</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.period} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono">{s.period}</td>
                    <td className="px-4 py-3">{formatPrice(s.grossSales, s.currency)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      -{formatPrice(s.fee, s.currency)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(s.payout, s.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === 'COMPLETED' ? 'secondary' : 'default'}>
                        {s.status === 'COMPLETED' ? '완료' : '예정'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.settledAt
                        ? new Date(s.settledAt).toLocaleDateString('ko-KR')
                        : '-'}
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
