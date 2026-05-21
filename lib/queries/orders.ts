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
import { cartKeys } from '@/lib/queries/cart';
import type {
  CreateOrderRequest,
  Order,
  OrderDetail,
  PageResponse,
} from '@/types/api';

/**
 * 주문 도메인 — TanStack Query hooks.
 *
 * 백엔드 endpoint:
 *   GET  /api/orders/me?page=&size=         → PageResponse<Order>
 *   POST /api/orders/me                     → OrderDetail (장바구니 자동 비움)
 *   GET  /api/orders/me/{orderNumber}       → OrderDetail
 *   POST /api/orders/me/{orderNumber}/cancel → OrderDetail
 *
 * 모두 인증 필요 (Bearer).
 */

export const DEFAULT_ORDER_PAGE_SIZE = 10;

type MyOrdersParams = {
  page?: number;
  size?: number;
};

export const orderKeys = {
  all: ['orders'] as const,
  myLists: () => [...orderKeys.all, 'my', 'list'] as const,
  myList: (params: MyOrdersParams) => [...orderKeys.myLists(), params] as const,
  myDetails: () => [...orderKeys.all, 'my', 'detail'] as const,
  myDetail: (orderNumber: string) =>
    [...orderKeys.myDetails(), orderNumber] as const,
};

export function useMyOrders(
  params: MyOrdersParams = {},
): UseQueryResult<PageResponse<Order>> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const search = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? DEFAULT_ORDER_PAGE_SIZE),
  }).toString();

  return useQuery({
    queryKey: orderKeys.myList(params),
    queryFn: () =>
      apiFetch<PageResponse<Order>>(`/api/orders/me?${search}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}

export function useOrderDetail(orderNumber: string): UseQueryResult<OrderDetail> {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: orderKeys.myDetail(orderNumber),
    queryFn: () =>
      apiFetch<OrderDetail>(`/api/orders/me/${orderNumber}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken && orderNumber.length > 0,
  });
}

export function useCreateOrder(): UseMutationResult<
  OrderDetail,
  Error,
  CreateOrderRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      apiFetch<OrderDetail>('/api/orders/me', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: (order) => {
      // 주문 목록과 카트 모두 무효화 (서버가 카트 자동 비움)
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.setQueryData(orderKeys.myDetail(order.orderNumber), order);
    },
  });
}

export function useCancelOrder(): UseMutationResult<OrderDetail, Error, string> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderNumber) =>
      apiFetch<OrderDetail>(`/api/orders/me/${orderNumber}/cancel`, {
        method: 'POST',
        authToken: accessToken,
      }),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.myDetail(order.orderNumber), order);
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
    },
  });
}
