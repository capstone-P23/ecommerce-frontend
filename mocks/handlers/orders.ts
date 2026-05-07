import { http, HttpResponse } from 'msw';

import { mockOrders } from '../fixtures/orders';
import { mockProducts } from '../fixtures/products';

// [ORD-001~004, PAY-001~002] 장바구니 / 주문 / 결제
export const orderHandlers = [
  // GET /api/cart
  http.get('/api/cart', () => {
    return HttpResponse.json({
      data: {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 5, quantity: 1 },
        ],
      },
    });
  }),

  // POST /api/cart
  http.post('/api/cart', async ({ request }) => {
    const body = (await request.json()) as { productId: number; quantity: number };
    return HttpResponse.json({ data: { added: body } }, { status: 201 });
  }),

  // DELETE /api/cart/{itemId}
  http.delete('/api/cart/:itemId', ({ params }) => {
    return HttpResponse.json({ data: { removedItemId: Number(params.itemId) } });
  }),

  // POST /api/orders
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as { productIds: number[] };
    const total = (body.productIds ?? []).reduce((sum, id) => {
      const product = mockProducts.find((p) => p.id === id);
      return sum + (product?.price ?? 0);
    }, 0);
    return HttpResponse.json(
      {
        data: {
          orderId: Date.now(),
          totalPrice: total,
          status: 'pending' as const,
        },
      },
      { status: 201 },
    );
  }),

  // POST /api/orders/payment
  http.post('/api/orders/payment', async () => {
    return HttpResponse.json({ data: { paid: true, status: 'paid' } });
  }),

  // POST /api/orders/discount
  http.post('/api/orders/discount', async ({ request }) => {
    const body = (await request.json()) as { couponId?: number; points?: number };
    const discount = (body.couponId ? 3000 : 0) + (body.points ?? 0);
    return HttpResponse.json({ data: { discount } });
  }),

  // POST /api/orders/{orderId}/claim — 취소·반품·교환
  http.post('/api/orders/:orderId/claim', async ({ params, request }) => {
    const body = (await request.json()) as { type?: string };
    return HttpResponse.json({
      data: {
        orderId: Number(params.orderId),
        claimType: body.type ?? 'cancel',
        status: 'requested',
      },
    });
  }),

  // GET /api/orders?userId=
  http.get('/api/orders', () => {
    return HttpResponse.json({ data: mockOrders });
  }),
];
