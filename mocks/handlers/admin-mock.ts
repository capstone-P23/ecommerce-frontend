import { http, HttpResponse } from 'msw';

import type {
  SellerApplicationStatus,
  SellerGrade,
  SettlementPolicy,
} from '@/types/api';

import {
  adminMockState,
  setSellerGrade,
  setSellerStatus,
  toggleBannerActive,
  updatePolicy,
} from '../fixtures/admin-mock';

/**
 * Admin mock-only 핸들러 (phase 7c).
 * 백엔드 endpoint 가 정해지면 이 파일 삭제 + 정렬.
 *
 * 자연스러운 path 컨벤션:
 *   GET   *​/api/admin/dashboard/stats
 *   GET   *​/api/admin/sellers
 *   PATCH *​/api/admin/sellers/{id}/status
 *   PATCH *​/api/admin/sellers/{id}/grade
 *   GET   *​/api/admin/policy/settlement
 *   PATCH *​/api/admin/policy/settlement
 *   GET   *​/api/admin/banners
 *   PATCH *​/api/admin/banners/{id}/active
 *   GET   *​/api/admin/security-logs
 */
export const adminMockHandlers = [
  // ─── dashboard ────────────────────────────────────────────
  http.get('*/api/admin/dashboard/stats', () =>
    HttpResponse.json(adminMockState.stats),
  ),

  // ─── sellers ──────────────────────────────────────────────
  http.get('*/api/admin/sellers', () =>
    HttpResponse.json(adminMockState.sellers),
  ),

  http.patch('*/api/admin/sellers/:id/status', async ({ params, request }) => {
    const body = (await request.json()) as { status: SellerApplicationStatus };
    if (!body?.status) {
      return HttpResponse.json({ error: 'status required' }, { status: 400 });
    }
    const seller = setSellerStatus(Number(params.id), body.status);
    if (!seller) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(seller);
  }),

  http.patch('*/api/admin/sellers/:id/grade', async ({ params, request }) => {
    const body = (await request.json()) as { grade: SellerGrade };
    if (!body?.grade) {
      return HttpResponse.json({ error: 'grade required' }, { status: 400 });
    }
    const seller = setSellerGrade(Number(params.id), body.grade);
    if (!seller) {
      return HttpResponse.json(
        { error: 'Not Found or not approved' },
        { status: 404 },
      );
    }
    return HttpResponse.json(seller);
  }),

  // ─── policy ───────────────────────────────────────────────
  http.get('*/api/admin/policy/settlement', () =>
    HttpResponse.json(adminMockState.policy),
  ),

  http.patch('*/api/admin/policy/settlement', async ({ request }) => {
    const body = (await request.json()) as Partial<SettlementPolicy>;
    return HttpResponse.json(updatePolicy(body));
  }),

  // ─── banners ──────────────────────────────────────────────
  http.get('*/api/admin/banners', () =>
    HttpResponse.json(adminMockState.banners),
  ),

  http.patch('*/api/admin/banners/:id/active', ({ params }) => {
    const banner = toggleBannerActive(Number(params.id));
    if (!banner) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(banner);
  }),

  // ─── security logs ────────────────────────────────────────
  http.get('*/api/admin/security-logs', () =>
    HttpResponse.json(adminMockState.securityLogs),
  ),
];
