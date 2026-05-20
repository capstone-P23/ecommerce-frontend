'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductDetail } from '@/lib/queries/products';
import { formatPrice } from '@/lib/format';

import { ComingSoonSection } from './coming-soon-section';
import { ProductStatusBadge } from './product-status-badge';

type Props = {
  productId: number;
  storeDomain: string;
};

export function ProductDetailView({ productId, storeDomain }: Props) {
  const { data: product, isLoading, isError, error } = useProductDetail(productId);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError) return <ProductDetailError message={(error as Error)?.message ?? '오류'} storeDomain={storeDomain} />;
  if (!product) return null;

  const isAvailable = product.status === 'ACTIVE' && product.inStock;

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.mainImageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
            <ProductStatusBadge status={product.status} />
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
        </header>

        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            재고: {product.totalStock.toLocaleString()}개
          </p>

          {/* 장바구니 담기는 Phase 5b 에서 활성화 */}
          <Button
            type="button"
            size="lg"
            disabled
            className="w-full"
            aria-disabled="true"
          >
            <ShoppingCart className="size-4" />
            장바구니 담기 (Phase 5b 예정)
          </Button>
          {!isAvailable && (
            <p className="text-xs text-destructive">현재 구매할 수 없는 상품입니다.</p>
          )}
        </div>

        <ComingSoonSection title="상품 리뷰 · Q&A" plannedPhase="백엔드 구현 후" />
      </div>
    </article>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function ProductDetailError({ message, storeDomain }: { message: string; storeDomain: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <Link href={`/consumer/${storeDomain}/products`} className="text-sm underline">
        상품 목록으로 돌아가기
      </Link>
    </div>
  );
}
