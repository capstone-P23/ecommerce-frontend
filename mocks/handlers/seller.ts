import { http, HttpResponse } from 'msw';

import { mockOrders } from '../fixtures/orders';
import { mockProducts } from '../fixtures/products';
import { mockUsers } from '../fixtures/users';

// [SEL-*] 판매자
export const sellerHandlers = [
  // GET /api/seller/stats
  http.get('/api/seller/stats', () => {
    return HttpResponse.json({
      data: {
        revenueToday: 1230000,
        ordersToday: 24,
        stockAlerts: 3,
        pendingShipments: 12,
      },
    });
  }),

  // GET /api/seller/members
  http.get('/api/seller/members', () => {
    return HttpResponse.json({ data: mockUsers.filter((u) => u.role === 'consumer') });
  }),

  // GET /api/seller/products
  http.get('/api/seller/products', () => {
    return HttpResponse.json({ data: mockProducts });
  }),

  // POST /api/seller/products
  http.post('/api/seller/products', async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof mockProducts)[number]>;
    return HttpResponse.json(
      { data: { id: Date.now(), ...body } },
      { status: 201 },
    );
  }),

  // GET /api/seller/products/{id}/options
  http.get('/api/seller/products/:id/options', ({ params }) => {
    return HttpResponse.json({
      data: [
        { id: 1, productId: Number(params.id), name: '사이즈 S', stock: 30, price: 0 },
        { id: 2, productId: Number(params.id), name: '사이즈 M', stock: 12, price: 0 },
      ],
    });
  }),

  // POST /api/seller/products/{id}/options
  http.post('/api/seller/products/:id/options', async ({ params, request }) => {
    const body = (await request.json()) as { name?: string; stock?: number };
    return HttpResponse.json(
      {
        data: {
          id: Date.now(),
          productId: Number(params.id),
          name: body.name ?? '',
          stock: body.stock ?? 0,
        },
      },
      { status: 201 },
    );
  }),

  // GET /api/seller/orders
  http.get('/api/seller/orders', () => {
    return HttpResponse.json({ data: mockOrders });
  }),

  // POST /api/seller/orders/{id}/invoice
  http.post('/api/seller/orders/:id/invoice', async ({ params, request }) => {
    const body = (await request.json()) as { trackingNumber?: string };
    return HttpResponse.json({
      data: {
        orderId: Number(params.id),
        trackingNumber: body.trackingNumber ?? '',
        status: 'shipped',
      },
    });
  }),

  // GET /api/seller/stock
  http.get('/api/seller/stock', () => {
    return HttpResponse.json({
      data: mockProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        stock: 50 - p.id * 5,
        threshold: 10,
      })),
    });
  }),

  // POST /api/seller/stock/order
  http.post('/api/seller/stock/order', async ({ request }) => {
    const body = (await request.json()) as { items?: unknown };
    return HttpResponse.json(
      { data: { id: Date.now(), items: body.items ?? [] } },
      { status: 201 },
    );
  }),

  // GET /api/seller/settlement
  http.get('/api/seller/settlement', () => {
    return HttpResponse.json({
      data: [
        { period: '2026-04', amount: 8430000, status: 'completed' },
        { period: '2026-03', amount: 7120000, status: 'completed' },
      ],
    });
  }),

  // GET /api/seller/cs
  http.get('/api/seller/cs', () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          subject: '배송 지연 문의',
          status: 'open',
          createdAt: '2026-04-29T10:00:00Z',
        },
        {
          id: 2,
          subject: '환불 진행 상황',
          status: 'in_progress',
          createdAt: '2026-04-28T14:00:00Z',
        },
      ],
    });
  }),
];
