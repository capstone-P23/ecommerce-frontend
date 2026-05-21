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
  SellerInquiry,
  SellerMember,
  SellerOrderDetail,
  SellerOrderListItem,
  SellerProduct,
  SellerProductOption,
  SellerSettlement,
  SellerStats,
} from '@/types/api';

/**
 * Seller mock-only 도메인 hooks (phase 6b).
 * 백엔드 endpoint 가 추가되면 이 파일을 lib/queries/seller.ts 로 통합 + mock 제거.
 */

export const sellerMockKeys = {
  all: ['seller-mock'] as const,
  stats: () => [...sellerMockKeys.all, 'stats'] as const,
  members: () => [...sellerMockKeys.all, 'members'] as const,
  products: () => [...sellerMockKeys.all, 'products'] as const,
  productOptions: (productId: number) =>
    [...sellerMockKeys.all, 'products', productId, 'options'] as const,
  orders: () => [...sellerMockKeys.all, 'orders'] as const,
  orderDetail: (orderNumber: string) =>
    [...sellerMockKeys.all, 'orders', orderNumber] as const,
  settlements: () => [...sellerMockKeys.all, 'settlements'] as const,
  inquiries: () => [...sellerMockKeys.all, 'inquiries'] as const,
};

const useToken = () => useAuthStore((s) => s.accessToken);

export function useSellerStats(): UseQueryResult<SellerStats> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.stats(),
    queryFn: () => apiFetch<SellerStats>('/api/seller/dashboard/stats', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useSellerMembers(): UseQueryResult<SellerMember[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.members(),
    queryFn: () => apiFetch<SellerMember[]>('/api/seller/members', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useSellerProducts(): UseQueryResult<SellerProduct[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.products(),
    queryFn: () => apiFetch<SellerProduct[]>('/api/seller/products', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useSellerProductOptions(
  productId: number,
): UseQueryResult<SellerProductOption[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.productOptions(productId),
    queryFn: () =>
      apiFetch<SellerProductOption[]>(`/api/seller/products/${productId}/options`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken && productId > 0,
  });
}

type AddOptionInput = {
  productId: number;
  name: string;
  value: string;
  stock: number;
  priceDelta?: number;
};

export function useAddProductOption(): UseMutationResult<
  SellerProductOption[],
  Error,
  AddOptionInput
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...body }) =>
      apiFetch<SellerProductOption[]>(`/api/seller/products/${productId}/options`, {
        method: 'POST',
        body,
        authToken: accessToken,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: sellerMockKeys.productOptions(vars.productId),
      });
    },
  });
}

export function useSellerOrders(): UseQueryResult<SellerOrderListItem[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.orders(),
    queryFn: () =>
      apiFetch<SellerOrderListItem[]>('/api/seller/orders', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useSellerOrderDetail(orderNumber: string): UseQueryResult<SellerOrderDetail> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.orderDetail(orderNumber),
    queryFn: () =>
      apiFetch<SellerOrderDetail>(`/api/seller/orders/${orderNumber}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken && orderNumber.length > 0,
  });
}

type InvoiceInput = { orderNumber: string; trackingNumber: string };

export function useRegisterInvoice(): UseMutationResult<SellerOrderDetail, Error, InvoiceInput> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderNumber, trackingNumber }) =>
      apiFetch<SellerOrderDetail>(`/api/seller/orders/${orderNumber}/invoice`, {
        method: 'PATCH',
        body: { trackingNumber },
        authToken: accessToken,
      }),
    onSuccess: (detail) => {
      queryClient.setQueryData(sellerMockKeys.orderDetail(detail.orderNumber), detail);
      queryClient.invalidateQueries({ queryKey: sellerMockKeys.orders() });
    },
  });
}

export function useSellerSettlements(): UseQueryResult<SellerSettlement[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.settlements(),
    queryFn: () =>
      apiFetch<SellerSettlement[]>('/api/seller/settlements', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useSellerInquiries(): UseQueryResult<SellerInquiry[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: sellerMockKeys.inquiries(),
    queryFn: () =>
      apiFetch<SellerInquiry[]>('/api/seller/inquiries', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

type AnswerInput = { inquiryId: number; answer: string };

export function useAnswerInquiry(): UseMutationResult<SellerInquiry, Error, AnswerInput> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inquiryId, answer }) =>
      apiFetch<SellerInquiry>(`/api/seller/inquiries/${inquiryId}/answer`, {
        method: 'PATCH',
        body: { answer },
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerMockKeys.inquiries() });
    },
  });
}
