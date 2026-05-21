'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth/store';
import { formatPrice } from '@/lib/format';
import { useMyOrders } from '@/lib/queries/orders';
import { cn } from '@/lib/utils';

import { OrderStatusBadge } from './order-status-badge';

const SKELETON_COUNT = 3;

type Props = {
  storeDomain: string;
};

export function OrderListView({ storeDomain }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const ordersQuery = useMyOrders();

  if (!accessToken) return <OrderLoginPrompt />;
  if (ordersQuery.isLoading) return <OrderListSkeleton />;
  if (ordersQuery.isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        {(ordersQuery.error as Error)?.message ?? '주문 내역을 불러오지 못했습니다.'}
      </div>
    );
  }

  const orders = ordersQuery.data?.content ?? [];
  if (orders.length === 0) return <OrderEmpty storeDomain={storeDomain} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">주문 내역</h1>

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.orderNumber}>
            <Link
              href={`/consumer/${storeDomain}/mypage/orders/${order.orderNumber}`}
              className="block"
            >
              <Card className="transition-colors hover:bg-muted/30">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString('ko-KR')} · 상품 {order.itemCount}종
                    </p>
                  </div>
                  <p className="text-base font-semibold">
                    {formatPrice(order.totalAmount, order.currency)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderLoginPrompt() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <Package className="mx-auto size-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">로그인이 필요합니다</h1>
      <Link href="/login" className={cn(buttonVariants({ variant: 'default' }))}>
        로그인하러 가기
      </Link>
    </div>
  );
}

function OrderEmpty({ storeDomain }: { storeDomain: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <Package className="mx-auto size-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">주문 내역이 없습니다</h1>
      <Link
        href={`/consumer/${storeDomain}/products`}
        className={cn(buttonVariants({ variant: 'default' }))}
      >
        상품 둘러보기
      </Link>
    </div>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
