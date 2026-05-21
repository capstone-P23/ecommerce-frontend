'use client';

import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useCancelOrder, useOrderDetail } from '@/lib/queries/orders';

import { OrderStatusBadge } from './order-status-badge';

type Props = {
  orderNumber: string;
  storeDomain: string;
};

export function OrderDetailView({ orderNumber, storeDomain }: Props) {
  const { data: order, isLoading, isError, error } = useOrderDetail(orderNumber);
  const cancelMutation = useCancelOrder();

  if (isLoading) return <OrderDetailSkeleton />;
  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        {(error as Error)?.message ?? '주문을 불러오지 못했습니다.'}
      </div>
    );
  }
  if (!order) return null;

  const canCancel = order.status === 'PENDING';

  const handleCancel = () => {
    cancelMutation.mutate(order.orderNumber, {
      onSuccess: () => toast.success('주문을 취소했습니다.'),
      onError: (e) => toast.error(`취소 실패: ${e.message}`),
    });
  };

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <Link
          href={`/consumer/${storeDomain}/mypage/orders`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 주문 내역
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-mono">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          주문일: {new Date(order.createdAt).toLocaleString('ko-KR')}
          {order.cancelledAt && (
            <> · 취소일: {new Date(order.cancelledAt).toLocaleString('ko-KR')}</>
          )}
        </p>
      </header>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">주문 상품</h2>
          <ul className="divide-y divide-border">
            {order.items.map((item, idx) => (
              <li
                key={`${item.productId}-${idx}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="size-14 rounded object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}개 × {formatPrice(item.priceAmount, item.currency)}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(item.subtotal, item.currency)}
                </p>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="text-sm">결제 금액</span>
            <span className="text-xl font-bold">
              {formatPrice(order.totalAmount, order.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <h2 className="text-base font-semibold">배송지</h2>
          <p>{order.delivery.receiverName} · {order.delivery.receiverPhone}</p>
          <p className="text-muted-foreground">
            ({order.delivery.zipCode}) {order.delivery.addressLine1}
            {order.delivery.addressLine2 ? ` ${order.delivery.addressLine2}` : ''}
          </p>
          {order.delivery.memo && (
            <p className="text-xs text-muted-foreground">메모: {order.delivery.memo}</p>
          )}
        </CardContent>
      </Card>

      {canCancel && (
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" disabled={cancelMutation.isPending} />
            }
          >
            주문 취소
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>주문을 취소하시겠어요?</DialogTitle>
              <DialogDescription>
                취소된 주문은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={handleCancel}>
                취소하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
