'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import {
  useRegisterInvoice,
  useSellerOrderDetail,
} from '@/lib/queries/seller-mock';

import { MockNotice } from './mock-notice';
import { SellerOrderStatusBadge } from './seller-order-status-badge';

type Props = {
  orderNumber: string;
};

export function SellerOrderDetailView({ orderNumber }: Props) {
  const { data: order, isLoading } = useSellerOrderDetail(orderNumber);
  const registerInvoice = useRegisterInvoice();
  const [trackingNumber, setTrackingNumber] = useState('');

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!order) return null;

  const canRegister =
    trackingNumber.trim().length > 0 &&
    !registerInvoice.isPending &&
    !order.trackingNumber;

  const handleSubmit = () => {
    registerInvoice.mutate(
      { orderNumber: order.orderNumber, trackingNumber },
      {
        onSuccess: () => toast.success('송장 등록 완료'),
        onError: (e) => toast.error(`송장 등록 실패: ${e.message}`),
      },
    );
  };

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <Link href="/seller/orders" className="text-sm text-muted-foreground hover:underline">
          ← 주문 목록
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-2xl font-bold">{order.orderNumber}</h1>
          <SellerOrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          주문일: {new Date(order.createdAt).toLocaleString('ko-KR')}
        </p>
        <MockNotice />
      </header>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">주문 상품</h2>
          <ul className="divide-y divide-border">
            {order.items.map((it) => (
              <li key={it.productId} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0 text-sm">
                <span>{it.productName} × {it.quantity}</span>
                <span className="font-medium">{formatPrice(it.subtotal, order.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-sm">합계</span>
            <span className="text-lg font-bold">{formatPrice(order.totalAmount, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 p-4 text-sm">
          <h2 className="text-base font-semibold">배송지</h2>
          <p>{order.receiverName} · {order.receiverPhone}</p>
          <p className="text-muted-foreground">{order.address}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">송장 정보</h2>
          {order.trackingNumber ? (
            <p className="text-sm">
              등록된 송장 번호:{' '}
              <span className="font-mono">{order.trackingNumber}</span>
            </p>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label>송장 번호</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="예: CJ123456789"
                />
              </div>
              <Button onClick={handleSubmit} disabled={!canRegister}>
                등록
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
