import { http, HttpResponse } from 'msw';

import type { CreateOrderRequest, Order, PageResponse } from '@/types/api';

import { clearCart } from '../fixtures/cart';
import {
  cancelOrder,
  createOrder,
  findOrderByNumber,
  snapshotMyOrders,
} from '../fixtures/orders';

/**
 * 주문 핸들러 — 백엔드 api-docs.json 정렬.
 *
 *   GET    *​/api/orders/me?page=&size=          → PageResponse<Order>
 *   POST   *​/api/orders/me                      → OrderDetail
 *                                                 (성공 시 cart 자동 비움)
 *   GET    *​/api/orders/me/{orderNumber}        → OrderDetail
 *   POST   *​/api/orders/me/{orderNumber}/cancel → OrderDetail
 *
 * Guest endpoint (/api/orders/guest) 는 현재 UI 동선이 없어 미구현.
 */

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

const toSummary = (order: ReturnType<typeof findOrderByNumber>): Order | null => {
  if (!order) return null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    itemCount: order.items.length,
    createdAt: order.createdAt,
  };
};

const buildPage = <T>(items: T[], page: number, size: number): PageResponse<T> => {
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

export const orderHandlers = [
  http.get('*/api/orders/me', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? DEFAULT_PAGE);
    const size = Number(url.searchParams.get('size') ?? DEFAULT_SIZE);
    const summaries = snapshotMyOrders()
      .map((order) => toSummary(order))
      .filter((x): x is Order => x !== null);
    return HttpResponse.json(buildPage(summaries, page, size));
  }),

  http.post('*/api/orders/me', async ({ request }) => {
    const body = (await request.json()) as CreateOrderRequest;
    if (!body?.items?.length || !body.delivery) {
      return HttpResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const order = createOrder(body);
    // 주문 성공 시 장바구니 비우기 (백엔드 동작 가정)
    clearCart();
    return HttpResponse.json(order, { status: 201 });
  }),

  http.get('*/api/orders/me/:orderNumber', ({ params }) => {
    const order = findOrderByNumber(String(params.orderNumber));
    if (!order) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(order);
  }),

  http.post('*/api/orders/me/:orderNumber/cancel', ({ params }) => {
    const cancelled = cancelOrder(String(params.orderNumber));
    if (!cancelled) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(cancelled);
  }),
];
