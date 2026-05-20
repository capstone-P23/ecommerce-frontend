'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import type { PageResponse, ProductDetail, ProductSummary } from '@/types/api';

/**
 * 상품 도메인 — TanStack Query hooks + queryKey 팩토리.
 *
 * 백엔드 endpoint:
 *   GET /api/products?categoryId=&keyword=&page=&size=
 *   GET /api/products/{id}
 */

// 페이지네이션 기본값 (소비자 화면 공용)
export const DEFAULT_PRODUCT_PAGE_SIZE = 20;

export type ProductListParams = {
  keyword?: string;
  categoryId?: number | null;
  page?: number;
  size?: number;
};

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

const buildProductSearchParams = (params: ProductListParams): string => {
  const search = new URLSearchParams();
  if (params.keyword) search.set('keyword', params.keyword);
  if (params.categoryId != null) search.set('categoryId', String(params.categoryId));
  search.set('page', String(params.page ?? 0));
  search.set('size', String(params.size ?? DEFAULT_PRODUCT_PAGE_SIZE));
  return search.toString();
};

export function useProductList(
  params: ProductListParams = {},
): UseQueryResult<PageResponse<ProductSummary>> {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () =>
      apiFetch<PageResponse<ProductSummary>>(
        `/api/products?${buildProductSearchParams(params)}`,
      ),
  });
}

export function useProductDetail(id: number): UseQueryResult<ProductDetail> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiFetch<ProductDetail>(`/api/products/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}
