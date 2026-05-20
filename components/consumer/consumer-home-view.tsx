'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/queries/categories';
import { useProductList } from '@/lib/queries/products';
import type { ProductSummary } from '@/types/api';

import { CategoryFilter } from './category-filter';
import { ProductGrid } from './product-grid';

const HOME_PRODUCTS_SIZE = 10;

type Props = {
  storeDomain: string;
};

/**
 * 소비자 홈 — 카테고리 칩 + 상품 첫 페이지 미리보기.
 * (페이지네이션은 /products 로 위임)
 */
export function ConsumerHomeView({ storeDomain }: Props) {
  const router = useRouter();
  const categoriesQuery = useCategories();
  const productsQuery = useProductList({ page: 0, size: HOME_PRODUCTS_SIZE });

  const productHref = (product: ProductSummary) =>
    `/consumer/${storeDomain}/products/${product.id}`;

  const navigateToProducts = (categoryId: number | null) => {
    const params = categoryId != null ? `?categoryId=${categoryId}` : '';
    router.push(`/consumer/${storeDomain}/products${params}`);
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold">전체 상품</h1>
        <CategoryFilter
          categories={categoriesQuery.data ?? []}
          selectedId={null}
          onSelect={navigateToProducts}
        />
      </section>

      <section className="space-y-4">
        <ProductGrid
          products={productsQuery.data?.content ?? []}
          hrefFor={productHref}
          isLoading={productsQuery.isLoading}
        />
        <div className="flex justify-center p-2">
          <Link
            href={`/consumer/${storeDomain}/products`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex items-center px-2',
            )}
          >
            모든 상품 보기
            <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
