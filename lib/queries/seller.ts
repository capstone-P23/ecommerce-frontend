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
  CreatePurchaseOrderRequest,
  PageResponse,
  PurchaseOrderListItem,
  PurchaseOrderRef,
  PurchaseOrderStatus,
  ReceiveAdjustRequest,
  ReceiveAdjustResponse,
  ReceiveCancelResponse,
  ReceiveHistory,
  ReceiveStockRequest,
  ReceiveStockResponse,
} from '@/types/api';

/**
 * 판매자 도메인 — 백엔드 정렬 hooks.
 * 모두 인증 필요 (Bearer).
 */

export const DEFAULT_PO_PAGE_SIZE = 20;
export const DEFAULT_HISTORY_PAGE_SIZE = 20;

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

export const sellerKeys = {
  all: ['seller'] as const,
  purchaseOrders: () => [...sellerKeys.all, 'purchase-orders'] as const,
  purchaseOrderList: (params: PurchaseOrderListParams) =>
    [...sellerKeys.purchaseOrders(), 'list', params] as const,
  receiveHistories: () => [...sellerKeys.all, 'receive-histories'] as const,
  receiveHistoryList: (params: ReceiveHistoryParams) =>
    [...sellerKeys.receiveHistories(), 'list', params] as const,
};

const buildSearch = (entries: Array<[string, string | number | null | undefined]>) => {
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
      queryClient.invalidateQueries({ queryKey: sellerKeys.receiveHistories() });
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
      apiFetch<ReceiveAdjustResponse>(`/api/seller/stocks/receive/${historyId}`, {
        method: 'PATCH',
        body: { receivedQuantity, reason },
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.receiveHistories() });
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
      queryClient.invalidateQueries({ queryKey: sellerKeys.receiveHistories() });
    },
  });
}
