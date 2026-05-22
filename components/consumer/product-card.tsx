import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/types/api';

import { ProductStatusBadge } from './product-status-badge';

// 5-column 그리드 기준 viewport 1280px 환경: 카드 폭 ≈ 240px
const CARD_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 240px';

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
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 z-10">
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
