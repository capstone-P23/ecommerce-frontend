import { http, HttpResponse } from 'msw';

import type {
  AddSkuRequest,
  AdjustStockRequest,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '@/types/api';

import type { PageResponse, MemberAdmin, Notification, StockHistory } from '@/types/api';

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
import {
  deleteMember,
  findMember,
  markAllAsRead,
  markAsRead,
  setBlacklist,
  snapshotMembers,
  snapshotStockHistories,
  unreadCount,
  adminNotificationsState,
} from '../fixtures/admin-members';

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

  // ─── Member ────────────────────────────────────────────────
  http.get('*/api/admin/members', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const all = snapshotMembers({ status, keyword });
    const start = page * size;
    const slice = all.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(all.length / size));
    const response: PageResponse<MemberAdmin> = {
      content: slice,
      totalElements: all.length,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: slice.length,
      empty: slice.length === 0,
    };
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/members/:memberId', ({ params }) => {
    const member = findMember(Number(params.memberId));
    if (!member) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  http.delete('*/api/admin/members/:memberId', ({ params }) => {
    const ok = deleteMember(Number(params.memberId));
    if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/api/admin/members/:memberId/blacklist', ({ params }) => {
    const member = setBlacklist(Number(params.memberId), true);
    if (!member) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  http.delete('*/api/admin/members/:memberId/blacklist', ({ params }) => {
    const member = setBlacklist(Number(params.memberId), false);
    if (!member) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  // ─── Notifications ─────────────────────────────────────────
  http.get('*/api/admin/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const all = adminNotificationsState.list;
    const start = page * size;
    const slice = all.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(all.length / size));
    const response: PageResponse<Notification> = {
      content: slice,
      totalElements: all.length,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: slice.length,
      empty: slice.length === 0,
    };
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/notifications/unread-count', () =>
    HttpResponse.json({ count: unreadCount() }),
  ),

  http.patch('*/api/admin/notifications/:id/read', ({ params }) => {
    const item = markAsRead(Number(params.id));
    if (!item) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  http.patch('*/api/admin/notifications/read-all', () => {
    markAllAsRead();
    return new HttpResponse(null, { status: 200 });
  }),

  // ─── Stock histories (per product) ─────────────────────────
  http.get(
    '*/api/admin/products/:productId/stock-histories',
    ({ params, request }) => {
      const url = new URL(request.url);
      const skuIdParam = url.searchParams.get('skuId');
      const changeType = url.searchParams.get('changeType');
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 20);

      const all = snapshotStockHistories(Number(params.productId), {
        skuId: skuIdParam ? Number(skuIdParam) : null,
        changeType,
      });
      const start = page * size;
      const slice = all.slice(start, start + size);
      const totalPages = Math.max(1, Math.ceil(all.length / size));
      const response: PageResponse<StockHistory> = {
        content: slice,
        totalElements: all.length,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
        numberOfElements: slice.length,
        empty: slice.length === 0,
      };
      return HttpResponse.json(response);
    },
  ),
];
