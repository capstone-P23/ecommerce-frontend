import { http, HttpResponse } from 'msw';

import { mockOrders } from '../fixtures/orders';
import { mockProducts } from '../fixtures/products';

// [ORD-002~004, PAY-001~002] 주문 / 결제
// cart 핸들러는 phase 5b 에서 mocks/handlers/cart.ts 로 분리됨 (백엔드 스키마 정렬).
// 아래 주문 관련 핸들러는 phase 5c 에서 백엔드 명세로 재정렬 예정.
export const orderHandlers = [
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
