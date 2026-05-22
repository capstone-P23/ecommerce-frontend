'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import { categoryKeys } from '@/lib/queries/categories';
import { productKeys } from '@/lib/queries/products';
import type {
  AddSkuRequest,
  AdjustStockRequest,
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductCreateRequest,
  ProductDetail,
  ProductUpdateRequest,
  Sku,
} from '@/types/api';

/**
 * Admin 도메인 mutations.
 *
 * 조회는 consumer endpoint (GET /api/products, /api/categories) 를 재사용한다.
 * (백엔드가 admin 전용 list endpoint 를 제공하지 않음)
 */

const useToken = () => useAuthStore((s) => s.accessToken);

// ─────────────────────────────────────────────────────────────
// Product
// ─────────────────────────────────────────────────────────────

export function useCreateProduct(): UseMutationResult<
  ProductDetail,
  Error,
  ProductCreateRequest
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<ProductDetail>('/api/admin/products', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

type UpdateProductArgs = { id: number } & ProductUpdateRequest;

export function useUpdateProduct(): UseMutationResult<
  ProductDetail,
  Error,
  UpdateProductArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      apiFetch<ProductDetail>(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body,
        authToken: accessToken,
      }),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDiscontinueProduct(): UseMutationResult<void, Error, number> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiFetch<void>(`/api/admin/products/${id}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// SKU
// ─────────────────────────────────────────────────────────────

type AddSkuArgs = { productId: number } & AddSkuRequest;

export function useAddSku(): UseMutationResult<Sku, Error, AddSkuArgs> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...body }) =>
      apiFetch<Sku>(`/api/admin/products/${productId}/skus`, {
        method: 'POST',
        body,
        authToken: accessToken,
      }),
    onSuccess: (_sku, vars) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(vars.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

type SkuTarget = { productId: number; skuId: number };

export function useRemoveSku(): UseMutationResult<void, Error, SkuTarget> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, skuId }) =>
      apiFetch<void>(`/api/admin/products/${productId}/skus/${skuId}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(vars.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

type AdjustStockArgs = SkuTarget & AdjustStockRequest;
type AdjustResp = { currentStock: number };

const buildAdjustHook = (direction: 'increase' | 'decrease') =>
  function useAdjustHook(): UseMutationResult<AdjustResp, Error, AdjustStockArgs> {
    const accessToken = useToken();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ productId, skuId, quantity }) =>
        apiFetch<AdjustResp>(
          `/api/admin/products/${productId}/skus/${skuId}/stock/${direction}`,
          { method: 'POST', body: { quantity }, authToken: accessToken },
        ),
      onSuccess: (_data, vars) => {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(vars.productId) });
      },
    });
  };

export const useIncreaseStock = buildAdjustHook('increase');
export const useDecreaseStock = buildAdjustHook('decrease');

// ─────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────

export function useCreateCategory(): UseMutationResult<
  Category,
  Error,
  CategoryCreateRequest
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<Category>('/api/admin/categories', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

type UpdateCategoryArgs = { id: number } & CategoryUpdateRequest;

export function useUpdateCategory(): UseMutationResult<
  Category,
  Error,
  UpdateCategoryArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      apiFetch<Category>(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        body,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
