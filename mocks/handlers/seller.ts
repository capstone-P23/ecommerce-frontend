import { http, HttpResponse } from 'msw';

import type {
  CreatePurchaseOrderRequest,
  PageResponse,
  PurchaseOrderListItem,
  PurchaseOrderStatus,
  QuestionResponse,
  QuestionStatus,
  ReceiveAdjustRequest,
  ReceiveAdjustResponse,
  ReceiveCancelResponse,
  ReceiveHistory,
  ReceiveStockRequest,
  ReceiveStockResponse,
} from '@/types/api';

import {
  adjustReceive,
  cancelReceive,
  createPurchaseOrder,
  receiveStock,
  snapshotPurchaseOrders,
  snapshotReceiveHistories,
} from '../fixtures/purchase-orders';

/**
 * 판매자 핸들러 — api-docs.json 의 실제 endpoint 6개에 정렬.
 *
 *   GET   *​/api/seller/purchase-orders                  → PageResponse<PurchaseOrderListItem>
 *   POST  *​/api/seller/purchase-orders                  → PurchaseOrderRef
 *   GET   *​/api/seller/stocks/receive-history           → PageResponse<ReceiveHistory>
 *   PATCH *​/api/seller/stocks/receive                   → ReceiveStockResponse
 *   PATCH *​/api/seller/stocks/receive/{id}              → ReceiveAdjustResponse
 *   PATCH *​/api/seller/stocks/receive/{id}/cancel       → ReceiveCancelResponse
 *
 * Dashboard / 회원 / 상품 / 주문 / 정산 / CS 등 mock-only 영역은
 * phase 6b 에서 별도 핸들러 파일로 추가 예정 (현재 endpoint 미정).
 */

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

const buildPage = <T>(
  items: T[],
  page: number,
  size: number,
): PageResponse<T> => {
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

const seedQuestions: QuestionResponse[] = [
  {
    id: 201,
    productId: 1,
    productName: '라이트 바람막이',
    memberName: '김지수',
    content: '비 오는 날에도 괜찮을까요?',
    secret: false,
    status: 'PENDING',
    createdAt: '2026-05-20T10:30:00Z',
  },
  {
    id: 202,
    productId: 2,
    productName: '프리미엄 코튼 티셔츠',
    memberName: '박서윤',
    content: '세탁 후 수축이 있나요?',
    secret: false,
    status: 'ANSWERED',
    answer: '찬물 세탁 기준으로 수축률이 낮습니다.',
    answeredAt: '2026-05-21T09:00:00Z',
    createdAt: '2026-05-20T08:10:00Z',
  },
];

let sellerQuestions = [...seedQuestions];

export const sellerHandlers = [
  http.get('*/api/seller/purchase-orders', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as PurchaseOrderStatus | null;
    const page = Number(url.searchParams.get('page') ?? DEFAULT_PAGE);
    const size = Number(url.searchParams.get('size') ?? DEFAULT_SIZE);

    const all: PurchaseOrderListItem[] = snapshotPurchaseOrders();
    const filtered = status ? all.filter((o) => o.status === status) : all;
    return HttpResponse.json(buildPage(filtered, page, size));
  }),

  http.post('*/api/seller/purchase-orders', async ({ request }) => {
    const body = (await request.json()) as CreatePurchaseOrderRequest;
    if (
      !body?.skuId ||
      !body?.quantity ||
      !body?.supplierName ||
      !body?.expectedAt
    ) {
      return HttpResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const ref = createPurchaseOrder(body);
    return HttpResponse.json(ref, { status: 201 });
  }),

  http.get('*/api/seller/stocks/receive-history', ({ request }) => {
    const url = new URL(request.url);
    const skuIdParam = url.searchParams.get('skuId');
    const page = Number(url.searchParams.get('page') ?? DEFAULT_PAGE);
    const size = Number(url.searchParams.get('size') ?? DEFAULT_SIZE);

    const all: ReceiveHistory[] = snapshotReceiveHistories();
    const filtered = skuIdParam
      ? all.filter((h) => h.skuId === Number(skuIdParam))
      : all;
    return HttpResponse.json(buildPage(filtered, page, size));
  }),

  http.patch('*/api/seller/stocks/receive', async ({ request }) => {
    const body = (await request.json()) as ReceiveStockRequest;
    const result = receiveStock(body.purchaseOrderId, body.receivedQuantity);
    if (!result) {
      return HttpResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 },
      );
    }
    const response: ReceiveStockResponse = {
      purchaseOrderId: result.po.purchaseOrderId,
      skuId: result.po.skuId,
      receivedQuantity: result.history.receivedQuantity,
      currentStock: result.currentStock,
      status: result.po.status,
    };
    return HttpResponse.json(response);
  }),

  http.patch('*/api/seller/stocks/receive/:id', async ({ params, request }) => {
    const body = (await request.json()) as ReceiveAdjustRequest;
    if (!body?.reason) {
      return HttpResponse.json({ error: 'reason required' }, { status: 400 });
    }
    const result = adjustReceive(
      Number(params.id),
      body.receivedQuantity,
      body.reason,
    );
    if (!result) {
      return HttpResponse.json(
        { error: 'Receive history not found' },
        { status: 404 },
      );
    }
    const response: ReceiveAdjustResponse = {
      receiveHistoryId: result.history.stockHistoryId,
      skuId: result.history.skuId,
      originalQuantity: result.originalQty,
      adjustedQuantity: result.history.receivedQuantity,
      currentStock: result.newStock,
      reason: result.reason,
    };
    return HttpResponse.json(response);
  }),

  http.patch('*/api/seller/stocks/receive/:id/cancel', ({ params }) => {
    const result = cancelReceive(Number(params.id));
    if (!result) {
      return HttpResponse.json(
        { error: 'Receive history not found' },
        { status: 404 },
      );
    }
    const response: ReceiveCancelResponse = {
      receiveHistoryId: result.history.stockHistoryId,
      skuId: result.history.skuId,
      cancelledQuantity: result.cancelledQty,
      currentStock: result.newStock,
      purchaseOrderStatus: result.poStatus,
    };
    return HttpResponse.json(response);
  }),

  // ─── Seller Q&A ───────────────────────────────────────────
  http.get('*/api/seller/questions', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as QuestionStatus | null;
    const page = Number(url.searchParams.get('page') ?? DEFAULT_PAGE);
    const size = Number(url.searchParams.get('size') ?? DEFAULT_SIZE);
    const filtered = status
      ? sellerQuestions.filter((q) => q.status === status)
      : sellerQuestions;
    return HttpResponse.json(buildPage(filtered, page, size));
  }),

  http.post(
    '*/api/seller/questions/:questionId/answer',
    async ({ params, request }) => {
      const body = (await request.json()) as { content?: string };
      if (!body?.content) {
        return HttpResponse.json(
          { error: 'content required' },
          { status: 400 },
        );
      }
      const id = Number(params.questionId);
      const target = sellerQuestions.find((q) => q.id === id);
      if (!target)
        return HttpResponse.json(
          { error: 'Question not found' },
          { status: 404 },
        );
      const updated: QuestionResponse = {
        ...target,
        status: 'ANSWERED',
        answer: body.content,
        answeredAt: new Date().toISOString(),
      };
      sellerQuestions = sellerQuestions.map((q) => (q.id === id ? updated : q));
      return HttpResponse.json(updated);
    },
  ),

  http.patch(
    '*/api/seller/questions/:questionId/answer',
    async ({ params, request }) => {
      const body = (await request.json()) as { content?: string };
      if (!body?.content) {
        return HttpResponse.json(
          { error: 'content required' },
          { status: 400 },
        );
      }
      const id = Number(params.questionId);
      const target = sellerQuestions.find((q) => q.id === id);
      if (!target)
        return HttpResponse.json(
          { error: 'Question not found' },
          { status: 404 },
        );
      const updated: QuestionResponse = {
        ...target,
        status: 'ANSWERED',
        answer: body.content,
        answeredAt: new Date().toISOString(),
      };
      sellerQuestions = sellerQuestions.map((q) => (q.id === id ? updated : q));
      return HttpResponse.json(updated);
    },
  ),

  http.delete('*/api/seller/questions/:questionId/answer', ({ params }) => {
    const id = Number(params.questionId);
    const target = sellerQuestions.find((q) => q.id === id);
    if (!target)
      return HttpResponse.json(
        { error: 'Question not found' },
        { status: 404 },
      );
    const updated: QuestionResponse = {
      ...target,
      status: 'PENDING',
      answer: undefined,
      answeredAt: undefined,
    };
    sellerQuestions = sellerQuestions.map((q) => (q.id === id ? updated : q));
    return new HttpResponse(null, { status: 204 });
  }),
];
