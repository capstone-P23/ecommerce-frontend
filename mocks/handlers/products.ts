import { http, HttpResponse } from 'msw';

import type { PageResponse, ProductSummary } from '@/types/api';
import { mockProductDetails, mockProductSummaries } from '../fixtures/products';

/**
 * 상품 핸들러 — 백엔드 api-docs.json 기준 정렬.
 *
 *   GET /api/products?categoryId=&keyword=&page=&size=&sort=
 *     → PageResponse<ProductSummary>
 *   GET /api/products/{id}
 *     → ProductDetail
 *
 * 응답 envelope 는 백엔드 그대로 (data wrapper 없음).
 * origin 와일드카드 '*' — 절대(localhost:8080)/상대(/api/...) 모두 매치.
 */

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

const buildPage = (
  items: ProductSummary[],
  page: number,
  size: number,
): PageResponse<ProductSummary> => {
  const start = page * size;
  const slice = items.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(items.length / size));

  return {
    content: slice,
    totalElements: items.length,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    numberOfElements: slice.length,
    empty: slice.length === 0,
  };
};

export const productHandlers = [
  http.get('*/api/products', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword')?.trim() ?? '';
    const categoryIdParam = url.searchParams.get('categoryId');
    const page = Number(url.searchParams.get('page') ?? DEFAULT_PAGE);
    const size = Number(url.searchParams.get('size') ?? DEFAULT_SIZE);

    const filtered = mockProductSummaries.filter((product) => {
      const matchesKeyword = keyword.length === 0 || product.name.includes(keyword);
      const matchesCategory =
        !categoryIdParam ||
        product.categoryName ===
          // categoryId → category name (mock 내부 매핑)
          (
            {
              '1': '식품',
              '2': '음료',
              '3': '주방용품',
            } as Record<string, string>
          )[categoryIdParam];
      return matchesKeyword && matchesCategory;
    });

    return HttpResponse.json(buildPage(filtered, page, size));
  }),

  http.get('*/api/products/:id', ({ params }) => {
    const id = Number(params.id);
    const product = mockProductDetails.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),
];
