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
  AddCartItemRequest,
  Cart,
  UpdateCartItemRequest,
} from '@/types/api';

/**
 * 장바구니 도메인 — TanStack Query hooks.
 *
 * 백엔드 endpoint:
 *   GET    /api/cart
 *   DELETE /api/cart                 (전체 비우기)
 *   POST   /api/cart/items
 *   PATCH  /api/cart/items/{itemId}
 *   DELETE /api/cart/items/{itemId}
 *
 * 모두 인증 필요 (Bearer). 비로그인 시 useCart 는 disabled,
 * mutation 은 컴포넌트에서 사전 차단(로그인 페이지 유도) 권장.
 */

export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
};

export function useCart(): UseQueryResult<Cart> {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => apiFetch<Cart>('/api/cart', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations — 공통: 성공 시 cart detail 쿼리 invalidate
// ─────────────────────────────────────────────────────────────

export function useAddCartItem(): UseMutationResult<Cart, Error, AddCartItemRequest> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      apiFetch<Cart>('/api/cart/items', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: (cart) => {
      // 서버 응답(snapshot)을 그대로 캐시에 반영 → 추가 fetch 절약
      queryClient.setQueryData(cartKeys.detail(), cart);
    },
  });
}

type UpdateCartItemArgs = { itemId: number } & UpdateCartItemRequest;

export function useUpdateCartItemQuantity(): UseMutationResult<
  Cart,
  Error,
  UpdateCartItemArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }) =>
      apiFetch<Cart>(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        body: { quantity },
        authToken: accessToken,
      }),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.detail(), cart);
    },
  });
}

export function useRemoveCartItem(): UseMutationResult<Cart, Error, number> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) =>
      apiFetch<Cart>(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.detail(), cart);
    },
  });
}

export function useClearCart(): UseMutationResult<void, Error, void> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/cart', { method: 'DELETE', authToken: accessToken }),
    onSuccess: () => {
      // 전체 비우기는 응답이 비어있으므로 invalidate 로 refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
