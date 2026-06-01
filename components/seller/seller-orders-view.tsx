'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import {
  useCancelSellerOrder,
  useConfirmSellerOrders,
  useSellerOrderList,
} from '@/lib/queries/seller';
import type { OrderAdminListItem } from '@/types/api';

import { SellerOrderStatusBadge } from './seller-order-status-badge';

export function SellerOrdersView() {
  const { data, isLoading } = useSellerOrderList();
  const confirmOrders = useConfirmSellerOrders();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = data?.content ?? [];

  const handleConfirm = (orderId: number) => {
    confirmOrders.mutate(
      { orderIds: [orderId] },
      {
        onSuccess: () => toast.success('주문이 확정되었습니다.'),
        onError: (e) => toast.error(`확정 실패: ${e.message}`),
      },
    );
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">주문 관리</h1>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">주문 ID</th>
                  <th className="px-4 py-2.5">주문번호</th>
                  <th className="px-4 py-2.5">상품수</th>
                  <th className="px-4 py-2.5">결제금액</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5">주문일</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <OrderRow
                    key={o.orderId}
                    order={o}
                    onConfirm={handleConfirm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({
  order,
  onConfirm,
}: {
  order: OrderAdminListItem;
  onConfirm: (orderId: number) => void;
}) {
  const cancelOrder = useCancelSellerOrder();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonCode, setReasonCode] = useState('');

  const handleCancel = () => {
    const cancelReason = reason.trim();
    const cancelReasonCode = reasonCode.trim();
    if (!cancelReason || !cancelReasonCode) return;
    cancelOrder.mutate(
      { orderId: order.orderId, cancelReason, cancelReasonCode },
      {
        onSuccess: () => {
          toast.success('주문이 취소되었습니다.');
          setOpen(false);
          setReason('');
          setReasonCode('');
        },
        onError: (e) => toast.error(`취소 실패: ${e.message}`),
      },
    );
  };

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 font-mono text-xs">{order.orderId}</td>
      <td className="px-4 py-3 font-mono text-xs">
        <Link
          href={`/seller/orders/${order.orderId}`}
          className="hover:underline"
        >
          {order.orderNumber}
        </Link>
      </td>
      <td className="px-4 py-3">{order.itemCount}</td>
      <td className="px-4 py-3 font-semibold">
        {formatPrice(order.totalAmount)}
      </td>
      <td className="px-4 py-3">
        <SellerOrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleString('ko-KR')}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          {order.status === 'PENDING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfirm(order.orderId)}
            >
              확정
            </Button>
          )}
          {order.status !== 'CANCELLED' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button size="sm" variant="ghost" />}>
                취소
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>주문 취소</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>취소 사유</Label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>취소 사유 코드</Label>
                    <Input
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCancel}
                    disabled={
                      !reason.trim() ||
                      !reasonCode.trim() ||
                      cancelOrder.isPending
                    }
                  >
                    취소 처리
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </td>
    </tr>
  );
}
