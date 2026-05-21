import { http, HttpResponse } from 'msw';

import {
  addInquiryAnswer,
  addProductOption,
  sellerMockState,
  setOrderTracking,
} from '../fixtures/seller-mock';

/**
 * Seller mock-only 핸들러 (phase 6b).
 *
 * ⚠️ 백엔드 endpoint 가 아직 없는 영역. path 컨벤션은 자연스러운 형태로
 * 잡아두고 (예: /api/seller/dashboard), 백엔드가 정식 endpoint 추가 시
 * 이 핸들러를 제거하면 자동으로 실제 BE 로 흐름이 옮겨감.
 */
export const sellerMockHandlers = [
  http.get('*/api/seller/dashboard/stats', () =>
    HttpResponse.json(sellerMockState.stats),
  ),

  http.get('*/api/seller/members', () =>
    HttpResponse.json(sellerMockState.members),
  ),

  http.get('*/api/seller/products', () =>
    HttpResponse.json(sellerMockState.products),
  ),

  http.get('*/api/seller/products/:productId/options', ({ params }) => {
    const productId = Number(params.productId);
    return HttpResponse.json(
      sellerMockState.options.filter((o) => o.productId === productId),
    );
  }),

  http.post('*/api/seller/products/:productId/options', async ({ params, request }) => {
    const productId = Number(params.productId);
    const body = (await request.json()) as {
      name: string;
      value: string;
      stock: number;
      priceDelta?: number;
    };
    addProductOption({
      productId,
      name: body.name,
      value: body.value,
      stock: body.stock,
      priceDelta: body.priceDelta ?? 0,
    });
    return HttpResponse.json(
      sellerMockState.options.filter((o) => o.productId === productId),
      { status: 201 },
    );
  }),

  http.get('*/api/seller/orders', () =>
    HttpResponse.json(sellerMockState.orders),
  ),

  http.get('*/api/seller/orders/:orderNumber', ({ params }) => {
    const detail = sellerMockState.orderDetails.get(String(params.orderNumber));
    if (!detail) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(detail);
  }),

  http.patch('*/api/seller/orders/:orderNumber/invoice', async ({ params, request }) => {
    const body = (await request.json()) as { trackingNumber: string };
    if (!body?.trackingNumber) {
      return HttpResponse.json({ error: 'trackingNumber required' }, { status: 400 });
    }
    setOrderTracking(String(params.orderNumber), body.trackingNumber);
    const detail = sellerMockState.orderDetails.get(String(params.orderNumber));
    return HttpResponse.json(detail);
  }),

  http.get('*/api/seller/settlements', () =>
    HttpResponse.json(sellerMockState.settlements),
  ),

  http.get('*/api/seller/inquiries', () =>
    HttpResponse.json(sellerMockState.inquiries),
  ),

  http.patch('*/api/seller/inquiries/:inquiryId/answer', async ({ params, request }) => {
    const body = (await request.json()) as { answer: string };
    if (!body?.answer) {
      return HttpResponse.json({ error: 'answer required' }, { status: 400 });
    }
    addInquiryAnswer(Number(params.inquiryId), body.answer);
    return HttpResponse.json(
      sellerMockState.inquiries.find((i) => i.inquiryId === Number(params.inquiryId)),
    );
  }),
];
