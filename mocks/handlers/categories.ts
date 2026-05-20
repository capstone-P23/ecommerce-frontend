import { http, HttpResponse } from 'msw';

import { mockCategories } from '../fixtures/products';

/**
 * 카테고리 핸들러 — GET /api/categories → Category[]
 * (백엔드 응답은 배열 그대로)
 */
export const categoryHandlers = [
  http.get('*/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
];
