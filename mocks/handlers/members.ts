import { http, HttpResponse } from 'msw';

import { mockProducts } from '../fixtures/products';

// [MEM-004, INT-001~003] 마이페이지 - 혜택 / 좋아요 / 찜 / 최근 본 상품
export const memberHandlers = [
  // GET /api/users/benefits
  http.get('/api/users/benefits', () => {
    return HttpResponse.json({
      data: {
        coupons: [
          { id: 1, name: '신규 가입 3000원 할인', expiresAt: '2026-12-31T00:00:00Z' },
          { id: 2, name: '5월 한정 무료배송', expiresAt: '2026-05-31T00:00:00Z' },
        ],
        points: 5400,
      },
    });
  }),

  // POST /api/products/{productId}/like
  http.post('/api/products/:productId/like', ({ params }) => {
    return HttpResponse.json({
      data: { productId: Number(params.productId), liked: true },
    });
  }),

  // DELETE /api/products/{productId}/like
  http.delete('/api/products/:productId/like', ({ params }) => {
    return HttpResponse.json({
      data: { productId: Number(params.productId), liked: false },
    });
  }),

  // GET /api/wishlist
  http.get('/api/wishlist', () => {
    return HttpResponse.json({ data: mockProducts.slice(0, 3) });
  }),

  // POST /api/wishlist
  http.post('/api/wishlist', async ({ request }) => {
    const body = (await request.json()) as { productId: number };
    return HttpResponse.json({ data: { added: body } }, { status: 201 });
  }),

  // DELETE /api/wishlist/{productId}
  http.delete('/api/wishlist/:productId', ({ params }) => {
    return HttpResponse.json({
      data: { productId: Number(params.productId), removed: true },
    });
  }),

  // GET /api/users/recently-viewed
  http.get('/api/users/recently-viewed', () => {
    return HttpResponse.json({ data: mockProducts.slice(2, 5) });
  }),

  // POST /api/users/recently-viewed
  http.post('/api/users/recently-viewed', async ({ request }) => {
    const body = (await request.json()) as { productId: number };
    return HttpResponse.json({ data: { recorded: body } }, { status: 201 });
  }),
];
