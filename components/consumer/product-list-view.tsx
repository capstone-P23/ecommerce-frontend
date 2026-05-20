'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useCategories } from '@/lib/queries/categories';
import { useProductList } from '@/lib/queries/products';
import type { ProductSummary } from '@/types/api';

import { CategoryFilter } from './category-filter';
import { Pagination } from './pagination';
import { ProductGrid } from './product-grid';

type Props = {
  storeDomain: string;
};

const KEYWORD_PARAM = 'keyword';
const CATEGORY_PARAM = 'categoryId';
const PAGE_PARAM = 'page';

const parsePage = (raw: string | null): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const parseCategoryId = (raw: string | null): number | null => {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * 상품 검색 결과 / 필터 / 페이지네이션.
 *
 * 검색 입력 자체는 헤더(TopNavigation) 가 단일 소스로 담당.
 * 이 페이지는 URL searchParams 를 읽어 결과만 렌더링.
 */
export function ProductListView({ storeDomain }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const keyword = searchParams.get(KEYWORD_PARAM) ?? '';
  const categoryId = parseCategoryId(searchParams.get(CATEGORY_PARAM));
  const page = parsePage(searchParams.get(PAGE_PARAM));

  const categoriesQuery = useCategories();
  const productsQuery = useProductList({ keyword, categoryId, page });

  const updateParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value == null || value === '') params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleCategorySelect = (id: number | null) => {
    updateParams({
      [CATEGORY_PARAM]: id != null ? String(id) : null,
      [PAGE_PARAM]: null,
    });
  };

  const handlePageChange = (next: number) => {
    updateParams({ [PAGE_PARAM]: next > 0 ? String(next) : null });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const productHref = (product: ProductSummary) =>
    `/consumer/${storeDomain}/products/${product.id}`;

  const result = productsQuery.data;
  const hasKeyword = keyword.length > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          {hasKeyword ? (
            <>
              <span className="text-muted-foreground">검색 결과:</span>{' '}
              <span>&ldquo;{keyword}&rdquo;</span>
            </>
          ) : (
            '전체 상품'
          )}
        </h1>
        {result && (
          <p className="text-sm text-muted-foreground">
            총 {result.totalElements.toLocaleString()}건
          </p>
        )}
      </header>

      <CategoryFilter
        categories={categoriesQuery.data ?? []}
        selectedId={categoryId}
        onSelect={handleCategorySelect}
      />

      <ProductGrid
        products={result?.content ?? []}
        hrefFor={productHref}
        isLoading={productsQuery.isLoading}
        emptyMessage={
          hasKeyword
            ? `"${keyword}" 검색 결과가 없습니다.`
            : '조건에 맞는 상품이 없습니다.'
        }
      />

      {result && (
        <Pagination
          currentPage={result.number}
          totalPages={result.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
