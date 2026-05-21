'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceiveHistoryList } from '@/lib/queries/seller';

import { ReceiveRowActions } from './receive-row-actions';

const SKELETON_COUNT = 3;

/**
 * 재고(입고 이력) 화면.
 * 백엔드는 SKU 별 현재 재고 별도 endpoint 없음 → ReceiveHistory.stockAfter 로 추정.
 * (SEL-STK-001 의 "재고 현황 표" 와 SEL-STK-002 의 "발주서" 는 분리된 페이지로 유지)
 */
export function StockView() {
  const historyQuery = useReceiveHistoryList();

  if (historyQuery.isLoading) return <StockSkeleton />;
  if (historyQuery.isError) return <p className="text-sm text-destructive">로드 실패</p>;

  const items = historyQuery.data?.content ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">입고 이력</h1>
        <p className="text-sm text-muted-foreground">
          입고된 항목을 조정하거나 취소할 수 있습니다. SKU 별 현재 재고는{' '}
          <code>stockAfter</code> 컬럼 참조.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">이력 ID</th>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">발주 ID</th>
                  <th className="px-4 py-2.5">입고 수량</th>
                  <th className="px-4 py-2.5">입고 후 재고</th>
                  <th className="px-4 py-2.5">입고 일시</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      입고 이력이 없습니다. 발주서 페이지에서 입고를 확정하면 이곳에
                      누적됩니다.
                    </td>
                  </tr>
                ) : (
                  items.map((h) => (
                    <tr key={h.stockHistoryId} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs">{h.stockHistoryId}</td>
                      <td className="px-4 py-3">{h.skuId}</td>
                      <td className="px-4 py-3 font-mono text-xs">{h.purchaseOrderId}</td>
                      <td className="px-4 py-3">{h.receivedQuantity}</td>
                      <td className="px-4 py-3 font-semibold">{h.stockAfter}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ReceiveRowActions history={h} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StockSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
