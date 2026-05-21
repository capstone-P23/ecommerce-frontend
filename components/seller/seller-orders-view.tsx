'use client';

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useSellerOrders } from '@/lib/queries/seller-mock';

import { MockNotice } from './mock-notice';
import { SellerOrderStatusBadge } from './seller-order-status-badge';

export function SellerOrdersView() {
  const { data: orders, isLoading } = useSellerOrders();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = orders ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <MockNotice />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">주문번호</th>
                  <th className="px-4 py-2.5">고객</th>
                  <th className="px-4 py-2.5">상품수</th>
                  <th className="px-4 py-2.5">결제금액</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5">송장</th>
                  <th className="px-4 py-2.5">주문일</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.orderNumber} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/seller/orders/${o.orderNumber}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3">{o.itemCount}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(o.totalAmount, o.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <SellerOrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {o.trackingNumber ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString('ko-KR')}
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
