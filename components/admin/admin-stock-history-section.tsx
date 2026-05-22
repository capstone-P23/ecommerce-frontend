'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStockHistories } from '@/lib/queries/admin';
import type { StockChangeType } from '@/types/api';

const CHANGE_TYPE_LABEL: Record<StockChangeType, string> = {
  ORDER: '주문',
  ORDER_CANCEL: '주문취소',
  ADMIN_INCREASE: '관리자 증가',
  ADMIN_DECREASE: '관리자 감소',
  SKU_CREATED: 'SKU 생성',
};

const CHANGE_TYPE_VARIANT: Record<
  StockChangeType,
  'default' | 'secondary' | 'destructive'
> = {
  ORDER: 'secondary',
  ORDER_CANCEL: 'default',
  ADMIN_INCREASE: 'default',
  ADMIN_DECREASE: 'secondary',
  SKU_CREATED: 'default',
};

type Props = {
  productId: number;
};

export function AdminStockHistorySection({ productId }: Props) {
  const { data, isLoading } = useAdminStockHistories(productId);

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  const items = data?.content ?? [];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="text-base font-semibold">재고 이력</h2>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            재고 이력이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">유형</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">수량</th>
                  <th className="py-2">재고 변화</th>
                  <th className="py-2">발생 시각</th>
                </tr>
              </thead>
              <tbody>
                {items.map((h) => (
                  <tr key={h.id} className="border-b border-border last:border-b-0">
                    <td className="py-2">
                      <Badge variant={CHANGE_TYPE_VARIANT[h.changeType]}>
                        {CHANGE_TYPE_LABEL[h.changeType]}
                      </Badge>
                    </td>
                    <td className="py-2 font-mono text-xs">{h.skuCode}</td>
                    <td className="py-2">{h.quantity}</td>
                    <td className="py-2 font-mono text-xs">
                      {h.stockBefore} → {h.stockAfter}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {new Date(h.occurredAt).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
