import { http, HttpResponse } from 'msw';

import { mockCategories, mockProducts } from '../fixtures/products';

// [PRD-001~004] 소비자 상품
export const productHandlers = [
  // GET /api/products/search?keyword=
  http.get('/api/products/search', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') ?? '';
    const filtered = keyword
      ? mockProducts.filter((p) => p.name.includes(keyword))
      : mockProducts;
    return HttpResponse.json({ data: filtered });
  }),

  // GET /api/products/recommend?userId=
  http.get('/api/products/recommend', () => {
    // Phase 5/8 에서 실제 추천 로직 (현재는 첫 5개)
    return HttpResponse.json({ data: mockProducts.slice(0, 5) });
  }),

  // GET /api/products/category/{id}
  http.get('/api/products/category/:id', ({ params }) => {
    const id = Number(params.id);
    const filtered = mockProducts.filter((p) => p.categoryId === id);
    return HttpResponse.json({
      data: { category: mockCategories.find((c) => c.id === id), products: filtered },
    });
  }),

  // GET /api/products/{productId}
  http.get('/api/products/:productId', ({ params }) => {
    const id = Number(params.productId);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return HttpResponse.json({ data: product });
  }),

  // GET /api/products/compare?ids=1,2,3
  http.get('/api/products/compare', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids')?.split(',').map(Number) ?? [];
    const result = mockProducts.filter((p) => ids.includes(p.id));
    return HttpResponse.json({ data: result });
  }),
];
