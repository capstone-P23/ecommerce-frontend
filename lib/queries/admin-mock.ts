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
  AdminBanner,
  AdminDashboardStats,
  SecurityLog,
  SellerApplication,
  SellerApplicationStatus,
  SellerGrade,
  SettlementPolicy,
} from '@/types/api';

/**
 * Admin mock-only hooks (phase 7c).
 * 백엔드 endpoint 추가 시 이 파일을 lib/queries/admin.ts 로 통합.
 */

export const adminMockKeys = {
  all: ['admin-mock'] as const,
  stats: () => [...adminMockKeys.all, 'stats'] as const,
  sellers: () => [...adminMockKeys.all, 'sellers'] as const,
  policy: () => [...adminMockKeys.all, 'policy'] as const,
  banners: () => [...adminMockKeys.all, 'banners'] as const,
  securityLogs: () => [...adminMockKeys.all, 'security-logs'] as const,
};

const useToken = () => useAuthStore((s) => s.accessToken);

// ─── dashboard ───────────────────────────────────────────────
export function useAdminDashboardStats(): UseQueryResult<AdminDashboardStats> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMockKeys.stats(),
    queryFn: () =>
      apiFetch<AdminDashboardStats>('/api/admin/dashboard/stats', {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}

// ─── sellers ─────────────────────────────────────────────────
export function useAdminSellers(): UseQueryResult<SellerApplication[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMockKeys.sellers(),
    queryFn: () =>
      apiFetch<SellerApplication[]>('/api/admin/sellers', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

type SetStatusArgs = { id: number; status: SellerApplicationStatus };

export function useSetSellerStatus(): UseMutationResult<
  SellerApplication,
  Error,
  SetStatusArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      apiFetch<SellerApplication>(`/api/admin/sellers/${id}/status`, {
        method: 'PATCH',
        body: { status },
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMockKeys.sellers() });
    },
  });
}

type SetGradeArgs = { id: number; grade: SellerGrade };

export function useSetSellerGrade(): UseMutationResult<
  SellerApplication,
  Error,
  SetGradeArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, grade }) =>
      apiFetch<SellerApplication>(`/api/admin/sellers/${id}/grade`, {
        method: 'PATCH',
        body: { grade },
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMockKeys.sellers() });
    },
  });
}

// ─── policy ─────────────────────────────────────────────────
export function useSettlementPolicy(): UseQueryResult<SettlementPolicy> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMockKeys.policy(),
    queryFn: () =>
      apiFetch<SettlementPolicy>('/api/admin/policy/settlement', {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}

export function useUpdateSettlementPolicy(): UseMutationResult<
  SettlementPolicy,
  Error,
  Partial<SettlementPolicy>
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<SettlementPolicy>('/api/admin/policy/settlement', {
        method: 'PATCH',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: (policy) => {
      queryClient.setQueryData(adminMockKeys.policy(), policy);
    },
  });
}

// ─── banners ────────────────────────────────────────────────
export function useAdminBanners(): UseQueryResult<AdminBanner[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMockKeys.banners(),
    queryFn: () =>
      apiFetch<AdminBanner[]>('/api/admin/banners', { authToken: accessToken }),
    enabled: !!accessToken,
  });
}

export function useToggleBannerActive(): UseMutationResult<
  AdminBanner,
  Error,
  number
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiFetch<AdminBanner>(`/api/admin/banners/${id}/active`, {
        method: 'PATCH',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMockKeys.banners() });
    },
  });
}

// ─── security logs ──────────────────────────────────────────
export function useAdminSecurityLogs(): UseQueryResult<SecurityLog[]> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMockKeys.securityLogs(),
    queryFn: () =>
      apiFetch<SecurityLog[]>('/api/admin/security-logs', {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}
