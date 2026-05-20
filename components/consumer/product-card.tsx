import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/types/api';

import { ProductStatusBadge } from './product-status-badge';

/**
 * 상품 카드 — 그리드 1칸.
 * fetch / 라우팅 결정은 부모가, 이 컴포넌트는 표시만 (Single Responsibility).
 */
type Props = {
  product: ProductSummary;
  href: string;
};

export function ProductCard({ product, href }: Props) {
  const isAvailable = product.status === 'ACTIVE' && product.inStock;

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-lg transition-opacity',
        !isAvailable && 'opacity-60',
      )}
    >
      <Card className="overflow-hidden border-border">
        <div className="relative aspect-square bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.mainImageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2">
            <ProductStatusBadge status={product.status} />
          </div>
        </div>
        <CardContent className="space-y-1 p-3">
          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
          <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
          <p className="text-base font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
