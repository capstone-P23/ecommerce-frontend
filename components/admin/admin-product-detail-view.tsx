'use client';

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useProductDetail } from '@/lib/queries/products';

import { AdminProductEditDialog } from './admin-product-edit-dialog';
import { AdminSkuSection } from './admin-sku-section';

type Props = {
  productId: number;
};

export function AdminProductDetailView({ productId }: Props) {
  const { data: product, isLoading } = useProductDetail(productId);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!product) return null;

  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline">
          ← 상품 목록
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            #{product.id} · {product.name}
          </h1>
          <AdminProductEditDialog product={product} />
        </div>
        <p className="text-sm text-muted-foreground">
          {product.category.name} · {formatPrice(product.price, product.currency)} ·{' '}
          상태 {product.status} · 총 재고 {product.totalStock}
        </p>
      </header>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <h2 className="text-base font-semibold">설명</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {product.description || '(설명 없음)'}
          </p>
        </CardContent>
      </Card>

      <AdminSkuSection productId={product.id} skus={product.skus} />
    </article>
  );
}
