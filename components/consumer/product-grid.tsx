import { Skeleton } from '@/components/ui/skeleton';
import type { ProductSummary } from '@/types/api';

import { ProductCard } from './product-card';

const GRID_CLASSES =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

const SKELETON_COUNT = 10;

type Props = {
  products: ProductSummary[];
  /** 카드 클릭 시 이동할 경로를 만드는 함수 — storeDomain 등 컨텍스트에 따라 다르므로 위임 */
  hrefFor: (product: ProductSummary) => string;
  /** 로딩 중일 때 스켈레톤 표시 */
  isLoading?: boolean;
  /** 빈 상태에 노출할 메시지 */
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  hrefFor,
  isLoading = false,
  emptyMessage = '상품이 없습니다.',
}: Props) {
  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} href={hrefFor(product)} />
      ))}
    </div>
  );
}
