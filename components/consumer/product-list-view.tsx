'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
 * 상품 검색 / 필터 / 페이지네이션.
 * URL search params 가 단일 진실 — 새로고침 / 공유 / 뒤로가기 모두 안전.
 */
export function ProductListView({ storeDomain }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const keyword = searchParams.get(KEYWORD_PARAM) ?? '';
  const categoryId = parseCategoryId(searchParams.get(CATEGORY_PARAM));
  const page = parsePage(searchParams.get(PAGE_PARAM));

  // 검색 입력은 즉시 URL 반영하지 않고 submit 시점에 반영 (네트워크 호출 절약)
  const [keywordDraft, setKeywordDraft] = useState(keyword);

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

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams({
      [KEYWORD_PARAM]: keywordDraft.trim() || null,
      [PAGE_PARAM]: null, // 검색어 바뀌면 첫 페이지로
    });
  };

  const handleCategorySelect = (id: number | null) => {
    updateParams({
      [CATEGORY_PARAM]: id != null ? String(id) : null,
      [PAGE_PARAM]: null,
    });
  };

  const handlePageChange = (next: number) => {
    updateParams({ [PAGE_PARAM]: next > 0 ? String(next) : null });
    // 페이지 이동 시 상단으로 스크롤
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const productHref = (product: ProductSummary) =>
    `/consumer/${storeDomain}/products/${product.id}`;

  const result = productsQuery.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">상품 검색</h1>

      <form onSubmit={handleSearchSubmit} role="search" className="relative max-w-2xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="keyword"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          placeholder="상품명으로 검색"
          aria-label="상품 검색"
          className="pl-9 pr-24"
        />
        <Button
          type="submit"
          variant="default"
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
        >
          검색
        </Button>
      </form>

      <CategoryFilter
        categories={categoriesQuery.data ?? []}
        selectedId={categoryId}
        onSelect={handleCategorySelect}
      />

      {result && (
        <p className="text-sm text-muted-foreground">
          총 {result.totalElements.toLocaleString()}건
        </p>
      )}

      <ProductGrid
        products={result?.content ?? []}
        hrefFor={productHref}
        isLoading={productsQuery.isLoading}
        emptyMessage={
          keyword
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
