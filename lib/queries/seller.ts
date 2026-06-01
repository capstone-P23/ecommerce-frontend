'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import type {
  AnswerRequest,
  CreatePurchaseOrderRequest,
  OrderAdminCancelRequest,
  OrderAdminCancelResponse,
  OrderAdminConfirmRequest,
  OrderAdminConfirmResponse,
  OrderAdminListItem,
  OrderAdminStatus,
  PageResponse,
  PurchaseOrderListItem,
  PurchaseOrderRef,
  PurchaseOrderStatus,
  QuestionResponse,
  QuestionStatus,
  ReceiveAdjustRequest,
  ReceiveAdjustResponse,
  ReceiveCancelResponse,
  ReceiveHistory,
  ReceiveStockRequest,
  ReceiveStockResponse,
  SettlementConfirmRequest,
  SettlementConfirmResponse,
  SettlementSummaryResponse,
} from '@/types/api';

/**
 * 판매자 도메인 — 백엔드 정렬 hooks.
 * 모두 인증 필요 (Bearer).
 */

export const DEFAULT_PO_PAGE_SIZE = 20;
export const DEFAULT_HISTORY_PAGE_SIZE = 20;
export const DEFAULT_SELLER_ORDER_PAGE_SIZE = 20;

type PurchaseOrderListParams = {
  status?: PurchaseOrderStatus | null;
  page?: number;
  size?: number;
};

type ReceiveHistoryParams = {
  skuId?: number | null;
  page?: number;
  size?: number;
};

type SellerQuestionParams = {
  status?: QuestionStatus | null;
  page?: number;
  size?: number;
};

type SellerOrderParams = {
  status?: OrderAdminStatus | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  size?: number;
};

type SettlementSearchParams = {
  from?: string | null;
  to?: string | null;
};

export const sellerKeys = {
  all: ['seller'] as const,
  purchaseOrders: () => [...sellerKeys.all, 'purchase-orders'] as const,
  purchaseOrderList: (params: PurchaseOrderListParams) =>
    [...sellerKeys.purchaseOrders(), 'list', params] as const,
  receiveHistories: () => [...sellerKeys.all, 'receive-histories'] as const,
  receiveHistoryList: (params: ReceiveHistoryParams) =>
    [...sellerKeys.receiveHistories(), 'list', params] as const,
  questions: () => [...sellerKeys.all, 'questions'] as const,
  questionList: (params: SellerQuestionParams) =>
    [...sellerKeys.questions(), 'list', params] as const,
  orders: () => [...sellerKeys.all, 'orders'] as const,
  orderList: (params: SellerOrderParams) =>
    [...sellerKeys.orders(), 'list', params] as const,
  settlements: () => [...sellerKeys.all, 'settlements'] as const,
  settlementSummary: (params: SettlementSearchParams) =>
    [...sellerKeys.settlements(), 'summary', params] as const,
};

const buildSearch = (
  entries: Array<[string, string | number | null | undefined]>,
) => {
  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value == null || value === '') continue;
    search.set(key, String(value));
  }
  return search.toString();
};

// ─────────────────────────────────────────────────────────────
// Purchase orders
// ─────────────────────────────────────────────────────────────

export function usePurchaseOrderList(
  params: PurchaseOrderListParams = {},
): UseQueryResult<PageResponse<PurchaseOrderListItem>> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = buildSearch([
    ['status', params.status ?? null],
    ['page', params.page ?? 0],
    ['size', params.size ?? DEFAULT_PO_PAGE_SIZE],
  ]);
  return useQuery({
    queryKey: sellerKeys.purchaseOrderList(params),
    queryFn: () =>
      apiFetch<PageResponse<PurchaseOrderListItem>>(
        `/api/seller/purchase-orders?${search}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useCreatePurchaseOrder(): UseMutationResult<
  PurchaseOrderRef,
  Error,
  CreatePurchaseOrderRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<PurchaseOrderRef>('/api/seller/purchase-orders', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.purchaseOrders() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Stock receive (입고)
// ─────────────────────────────────────────────────────────────

export function useReceiveHistoryList(
  params: ReceiveHistoryParams = {},
): UseQueryResult<PageResponse<ReceiveHistory>> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = buildSearch([
    ['skuId', params.skuId ?? null],
    ['page', params.page ?? 0],
    ['size', params.size ?? DEFAULT_HISTORY_PAGE_SIZE],
  ]);
  return useQuery({
    queryKey: sellerKeys.receiveHistoryList(params),
    queryFn: () =>
      apiFetch<PageResponse<ReceiveHistory>>(
        `/api/seller/stocks/receive-history?${search}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useReceiveStock(): UseMutationResult<
  ReceiveStockResponse,
  Error,
  ReceiveStockRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<ReceiveStockResponse>('/api/seller/stocks/receive', {
        method: 'PATCH',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.purchaseOrders() });
      queryClient.invalidateQueries({
        queryKey: sellerKeys.receiveHistories(),
      });
    },
  });
}

type AdjustArgs = { historyId: number } & ReceiveAdjustRequest;

export function useAdjustReceive(): UseMutationResult<
  ReceiveAdjustResponse,
  Error,
  AdjustArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ historyId, receivedQuantity, reason }) =>
      apiFetch<ReceiveAdjustResponse>(
        `/api/seller/stocks/receive/${historyId}`,
        {
          method: 'PATCH',
          body: { receivedQuantity, reason },
          authToken: accessToken,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sellerKeys.receiveHistories(),
      });
    },
  });
}

export function useCancelReceive(): UseMutationResult<
  ReceiveCancelResponse,
  Error,
  number
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (historyId) =>
      apiFetch<ReceiveCancelResponse>(
        `/api/seller/stocks/receive/${historyId}/cancel`,
        { method: 'PATCH', authToken: accessToken },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.purchaseOrders() });
      queryClient.invalidateQueries({
        queryKey: sellerKeys.receiveHistories(),
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Seller Q&A
// ─────────────────────────────────────────────────────────────

export const DEFAULT_SELLER_QUESTION_PAGE_SIZE = 10;

export function useSellerQuestions(
  params: SellerQuestionParams = {},
): UseQueryResult<PageResponse<QuestionResponse>> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = buildSearch([
    ['status', params.status ?? null],
    ['page', params.page ?? 0],
    ['size', params.size ?? DEFAULT_SELLER_QUESTION_PAGE_SIZE],
  ]);

  return useQuery({
    queryKey: sellerKeys.questionList(params),
    queryFn: () =>
      apiFetch<PageResponse<QuestionResponse>>(
        `/api/seller/questions?${search}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

type AnswerArgs = { questionId: number } & AnswerRequest;

export function useAnswerQuestion(): UseMutationResult<
  QuestionResponse,
  Error,
  AnswerArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, ...body }) =>
      apiFetch<QuestionResponse>(`/api/seller/questions/${questionId}/answer`, {
        method: 'POST',
        body,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.questions() });
    },
  });
}

export function useUpdateAnswer(): UseMutationResult<
  QuestionResponse,
  Error,
  AnswerArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, ...body }) =>
      apiFetch<QuestionResponse>(`/api/seller/questions/${questionId}/answer`, {
        method: 'PATCH',
        body,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.questions() });
    },
  });
}

export function useDeleteAnswer(): UseMutationResult<void, Error, number> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId) =>
      apiFetch<void>(`/api/seller/questions/${questionId}/answer`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.questions() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Seller Orders
// ─────────────────────────────────────────────────────────────

export function useSellerOrderList(
  params: SellerOrderParams = {},
): UseQueryResult<PageResponse<OrderAdminListItem>> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = buildSearch([
    ['status', params.status ?? null],
    ['from', params.from ?? null],
    ['to', params.to ?? null],
    ['page', params.page ?? 0],
    ['size', params.size ?? DEFAULT_SELLER_ORDER_PAGE_SIZE],
  ]);

  return useQuery({
    queryKey: sellerKeys.orderList(params),
    queryFn: () =>
      apiFetch<PageResponse<OrderAdminListItem>>(
        `/api/seller/orders?${search}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useConfirmSellerOrders(): UseMutationResult<
  OrderAdminConfirmResponse,
  Error,
  OrderAdminConfirmRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      apiFetch<OrderAdminConfirmResponse>('/api/seller/orders/confirm', {
        method: 'PATCH',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.orders() });
    },
  });
}

type CancelOrderArgs = { orderId: number } & OrderAdminCancelRequest;

export function useCancelSellerOrder(): UseMutationResult<
  OrderAdminCancelResponse,
  Error,
  CancelOrderArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, ...body }) =>
      apiFetch<OrderAdminCancelResponse>(
        `/api/seller/orders/${orderId}/cancel`,
        {
          method: 'POST',
          body,
          authToken: accessToken,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.orders() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Seller Settlements
// ─────────────────────────────────────────────────────────────

export function useSellerSettlementSummary(
  params: SettlementSearchParams = {},
): UseQueryResult<SettlementSummaryResponse> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = buildSearch([
    ['from', params.from ?? null],
    ['to', params.to ?? null],
  ]);

  return useQuery({
    queryKey: sellerKeys.settlementSummary(params),
    queryFn: () =>
      apiFetch<SettlementSummaryResponse>(
        `/api/seller/settlements${search ? `?${search}` : ''}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useConfirmSettlement(): UseMutationResult<
  SettlementConfirmResponse,
  Error,
  SettlementConfirmRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      apiFetch<SettlementConfirmResponse>('/api/seller/settlements/confirm', {
        method: 'PATCH',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.settlements() });
    },
  });
}
