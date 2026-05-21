'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePurchaseOrderList } from '@/lib/queries/seller';

import { PoStatusBadge } from './po-status-badge';
import { PurchaseOrderForm } from './purchase-order-form';
import { ReceiveConfirmDialog } from './receive-confirm-dialog';

const SKELETON_COUNT = 3;

export function StockOrderView() {
  const [createOpen, setCreateOpen] = useState(false);
  const ordersQuery = usePurchaseOrderList();

  if (ordersQuery.isLoading) return <StockOrderSkeleton />;
  if (ordersQuery.isError) return <p className="text-sm text-destructive">로드 실패</p>;

  const items = ordersQuery.data?.content ?? [];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">발주서 관리</h1>
          <p className="text-sm text-muted-foreground">
            발주 요청 / 입고 확정 처리. 백엔드 endpoint 정렬 완료.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            신규 발주
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신규 발주</DialogTitle>
              <DialogDescription>SKU 와 공급사 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <PurchaseOrderForm onCreated={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">발주 번호</th>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">수량</th>
                  <th className="px-4 py-2.5">공급사</th>
                  <th className="px-4 py-2.5">입고 예정</th>
                  <th className="px-4 py-2.5">상태</th>
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
                      발주 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((order) => (
                    <tr key={order.purchaseOrderId} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.purchaseOrderNumber}
                      </td>
                      <td className="px-4 py-3">{order.skuId}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">{order.supplierName}</td>
                      <td className="px-4 py-3">{order.expectedAt}</td>
                      <td className="px-4 py-3">
                        <PoStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.status === 'REQUESTED' && (
                          <ReceiveConfirmDialog order={order} />
                        )}
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

function StockOrderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
