'use client';

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useSellerProducts } from '@/lib/queries/seller-mock';
import type { SellerProductStatus } from '@/types/api';

import { MockNotice } from './mock-notice';

const STATUS_LABEL: Record<SellerProductStatus, string> = {
  ACTIVE: '판매중',
  SOLD_OUT: '품절',
  DISCONTINUED: '단종',
};

export function SellerProductsView() {
  const { data: products, isLoading } = useSellerProducts();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = products ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <MockNotice />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">상품명</th>
                  <th className="px-4 py-2.5">카테고리</th>
                  <th className="px-4 py-2.5">가격</th>
                  <th className="px-4 py-2.5">재고</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5 text-right">옵션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                    <td className="px-4 py-3">{formatPrice(p.price, p.currency)}</td>
                    <td className="px-4 py-3">{p.totalStock}</td>
                    <td className="px-4 py-3 text-xs">{STATUS_LABEL[p.status]}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/seller/products/${p.id}/options`}
                        className="text-xs underline"
                      >
                        옵션 관리 →
                      </Link>
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
