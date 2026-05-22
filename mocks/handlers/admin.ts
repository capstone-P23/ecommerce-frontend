import { http, HttpResponse } from 'msw';

import type {
  AddSkuRequest,
  AdjustStockRequest,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '@/types/api';

import {
  addSku,
  createCategory,
  createProduct,
  decreaseSkuStock,
  discontinueProduct,
  increaseSkuStock,
  removeSku,
  updateCategory,
  updateProduct,
} from '../fixtures/admin-products';

/**
 * Admin 핸들러 — 백엔드 api-docs.json 정렬.
 *
 * 상품:
 *   POST   *​/api/admin/products
 *   PATCH  *​/api/admin/products/{id}
 *   DELETE *​/api/admin/products/{id}                                   (단종)
 *   POST   *​/api/admin/products/{productId}/skus
 *   DELETE *​/api/admin/products/{productId}/skus/{skuId}
 *   POST   *​/api/admin/products/{productId}/skus/{skuId}/stock/increase
 *   POST   *​/api/admin/products/{productId}/skus/{skuId}/stock/decrease
 *
 * 카테고리:
 *   POST   *​/api/admin/categories
 *   PATCH  *​/api/admin/categories/{id}
 *
 * 회원 / 알림 / 재고 이력 endpoint 는 phase 7b 에서 추가.
 */
export const adminHandlers = [
  // Products
  http.post('*/api/admin/products', async ({ request }) => {
    const body = (await request.json()) as ProductCreateRequest;
    if (!body?.name || !body?.categoryId) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(createProduct(body), { status: 201 });
  }),

  http.patch('*/api/admin/products/:id', async ({ params, request }) => {
    const body = (await request.json()) as ProductUpdateRequest;
    const product = updateProduct(Number(params.id), body);
    if (!product) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.delete('*/api/admin/products/:id', ({ params }) => {
    const ok = discontinueProduct(Number(params.id));
    if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  // SKU
  http.post('*/api/admin/products/:productId/skus', async ({ params, request }) => {
    const body = (await request.json()) as AddSkuRequest;
    if (!body?.options?.length || body.initialStock == null) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    const sku = addSku(Number(params.productId), body);
    if (!sku) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(sku, { status: 201 });
  }),

  http.delete(
    '*/api/admin/products/:productId/skus/:skuId',
    ({ params }) => {
      const ok = removeSku(Number(params.productId), Number(params.skuId));
      if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.post(
    '*/api/admin/products/:productId/skus/:skuId/stock/increase',
    async ({ params, request }) => {
      const body = (await request.json()) as AdjustStockRequest;
      if (!body?.quantity || body.quantity < 1) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
      }
      const result = increaseSkuStock(
        Number(params.productId),
        Number(params.skuId),
        body,
      );
      if (!result) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return HttpResponse.json({ currentStock: result.sku.stock });
    },
  ),

  http.post(
    '*/api/admin/products/:productId/skus/:skuId/stock/decrease',
    async ({ params, request }) => {
      const body = (await request.json()) as AdjustStockRequest;
      if (!body?.quantity || body.quantity < 1) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
      }
      const result = decreaseSkuStock(
        Number(params.productId),
        Number(params.skuId),
        body,
      );
      if (!result) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return HttpResponse.json({ currentStock: result.sku.stock });
    },
  ),

  // Category
  http.post('*/api/admin/categories', async ({ request }) => {
    const body = (await request.json()) as CategoryCreateRequest;
    if (!body?.name || !body?.slug) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(createCategory(body), { status: 201 });
  }),

  http.patch('*/api/admin/categories/:id', async ({ params, request }) => {
    const body = (await request.json()) as CategoryUpdateRequest;
    const category = updateCategory(Number(params.id), body);
    if (!category) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(category);
  }),
];
