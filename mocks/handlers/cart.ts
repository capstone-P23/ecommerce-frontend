import { http, HttpResponse } from 'msw';

import type { AddCartItemRequest, UpdateCartItemRequest } from '@/types/api';

import {
  addCartItem,
  clearCart,
  removeCartItem,
  snapshotCart,
  updateCartItemQuantity,
} from '../fixtures/cart';

/**
 * 장바구니 핸들러 — 백엔드 api-docs.json 정렬.
 *
 *   GET    *​/api/cart                  → CartResponse
 *   DELETE *​/api/cart                  → 200 (전체 비우기)
 *   POST   *​/api/cart/items            → CartResponse
 *   PATCH  *​/api/cart/items/{itemId}   → CartResponse
 *   DELETE *​/api/cart/items/{itemId}   → CartResponse
 *
 * mocks/fixtures/cart.ts 의 mutable 상태를 직접 변경한다.
 */
export const cartHandlers = [
  http.get('*/api/cart', () => HttpResponse.json(snapshotCart())),

  http.delete('*/api/cart', () => {
    clearCart();
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/api/cart/items', async ({ request }) => {
    const body = (await request.json()) as AddCartItemRequest;
    if (!body?.productId || !body?.quantity || body.quantity < 1) {
      return HttpResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    addCartItem(body.productId, body.quantity);
    return HttpResponse.json(snapshotCart());
  }),

  http.patch('*/api/cart/items/:itemId', async ({ params, request }) => {
    const body = (await request.json()) as UpdateCartItemRequest;
    if (!body?.quantity || body.quantity < 1) {
      return HttpResponse.json({ error: 'quantity must be >= 1' }, { status: 400 });
    }
    updateCartItemQuantity(Number(params.itemId), body.quantity);
    return HttpResponse.json(snapshotCart());
  }),

  http.delete('*/api/cart/items/:itemId', ({ params }) => {
    removeCartItem(Number(params.itemId));
    return HttpResponse.json(snapshotCart());
  }),
];
