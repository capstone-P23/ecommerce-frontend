import { http, HttpResponse } from 'msw';

import { mockSellers } from '../fixtures/users';

// [ADM-*] 관리자
export const adminHandlers = [
  // GET /api/admin/stats
  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      data: {
        totalUsers: 12450,
        totalSellers: 87,
        totalRevenue: 423000000,
        activeStores: 64,
      },
    });
  }),

  // GET /api/admin/sellers
  http.get('/api/admin/sellers', () => {
    return HttpResponse.json({ data: mockSellers });
  }),

  // PATCH /api/admin/sellers/{id}/approve
  http.patch('/api/admin/sellers/:id/approve', async ({ params, request }) => {
    const body = (await request.json()) as { approve?: boolean };
    return HttpResponse.json({
      data: {
        sellerId: Number(params.id),
        status: body.approve ? 'approved' : 'rejected',
      },
    });
  }),

  // GET /api/admin/policy
  http.get('/api/admin/policy', () => {
    return HttpResponse.json({
      data: {
        commissionRate: 0.05,
        settlementCycle: 'monthly',
        minimumPayout: 10000,
      },
    });
  }),

  // PATCH /api/admin/policy
  http.patch('/api/admin/policy', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ data: { ...body, updatedAt: new Date().toISOString() } });
  }),

  // GET /api/admin/contents
  http.get('/api/admin/contents', () => {
    return HttpResponse.json({
      data: {
        banners: [
          { id: 1, title: '봄 신상품', imageUrl: '/banner/spring.jpg', active: true },
        ],
        categories: [
          { id: 1, name: '식품', order: 1 },
          { id: 2, name: '음료', order: 2 },
          { id: 3, name: '주방용품', order: 3 },
        ],
      },
    });
  }),

  // PATCH /api/admin/contents
  http.patch('/api/admin/contents', async () => {
    return HttpResponse.json({ data: { updated: true } });
  }),

  // GET /api/admin/logs
  http.get('/api/admin/logs', () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          type: 'login_failure',
          ip: '192.168.0.1',
          createdAt: '2026-04-30T08:00:00Z',
        },
        {
          id: 2,
          type: 'permission_denied',
          ip: '203.0.113.42',
          createdAt: '2026-04-30T09:30:00Z',
        },
      ],
    });
  }),
];
