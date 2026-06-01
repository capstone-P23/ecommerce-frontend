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
import { categoryKeys } from '@/lib/queries/categories';
import { productKeys } from '@/lib/queries/products';
import type {
  AddSkuRequest,
  AdjustStockRequest,
  Banner,
  BannerCreateRequest,
  BannerStatus,
  BannerUpdateRequest,
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  MemberAdmin,
  MemberStatus,
  Notification,
  PageResponse,
  PaymentsTimeSeriesResponse,
  RefundsTimeSeriesResponse,
  SalesStatsResponse,
  SalesTimeSeriesResponse,
  SellerApplicationStatus,
  SellerApplicationAdmin,
  ProductCreateRequest,
  ProductDetail,
  ProductUpdateRequest,
  Sku,
  StockChangeType,
  StockHistory,
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

export function useDiscontinueProduct(): UseMutationResult<
  void,
  Error,
  number
> {
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
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(vars.productId),
      });
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
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(vars.productId),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

type AdjustStockArgs = SkuTarget & AdjustStockRequest;
type AdjustResp = { currentStock: number };

const buildAdjustHook = (direction: 'increase' | 'decrease') =>
  function useAdjustHook(): UseMutationResult<
    AdjustResp,
    Error,
    AdjustStockArgs
  > {
    const accessToken = useToken();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ productId, skuId, quantity }) =>
        apiFetch<AdjustResp>(
          `/api/admin/products/${productId}/skus/${skuId}/stock/${direction}`,
          { method: 'POST', body: { quantity }, authToken: accessToken },
        ),
      onSuccess: (_data, vars) => {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(vars.productId),
        });
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

// ─────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────

type MemberListParams = {
  status?: MemberStatus | null;
  keyword?: string | null;
  page?: number;
  size?: number;
};

export const adminMemberKeys = {
  all: ['admin', 'members'] as const,
  list: (params: MemberListParams) =>
    [...adminMemberKeys.all, 'list', params] as const,
  detail: (id: number) => [...adminMemberKeys.all, 'detail', id] as const,
};

const DEFAULT_MEMBER_PAGE_SIZE = 20;

const buildMemberSearch = (params: MemberListParams) => {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.keyword) search.set('keyword', params.keyword);
  search.set('page', String(params.page ?? 0));
  search.set('size', String(params.size ?? DEFAULT_MEMBER_PAGE_SIZE));
  return search.toString();
};

export function useAdminMembers(
  params: MemberListParams = {},
): UseQueryResult<PageResponse<MemberAdmin>> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMemberKeys.list(params),
    queryFn: () =>
      apiFetch<PageResponse<MemberAdmin>>(
        `/api/admin/members?${buildMemberSearch(params)}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useAdminMember(id: number): UseQueryResult<MemberAdmin> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminMemberKeys.detail(id),
    queryFn: () =>
      apiFetch<MemberAdmin>(`/api/admin/members/${id}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken && id > 0,
  });
}

// ─────────────────────────────────────────────────────────────
// Admin — Seller applications
// ─────────────────────────────────────────────────────────────

type SellerApplicationParams = {
  status?: SellerApplicationStatus | null;
};

export const adminSellerApplicationKeys = {
  all: ['admin', 'seller-applications'] as const,
  list: (params: SellerApplicationParams) =>
    [...adminSellerApplicationKeys.all, 'list', params] as const,
};

export function useAdminSellerApplications(
  params: SellerApplicationParams = {},
): UseQueryResult<SellerApplicationAdmin[]> {
  const accessToken = useToken();
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  const query = search.toString();
  return useQuery({
    queryKey: adminSellerApplicationKeys.list(params),
    queryFn: () =>
      apiFetch<SellerApplicationAdmin[]>(
        `/api/admin/seller/applications${query ? `?${query}` : ''}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useApproveSellerApplication(): UseMutationResult<
  void,
  Error,
  number
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) =>
      apiFetch<void>(
        `/api/admin/seller/applications/${applicationId}/approve`,
        { method: 'POST', authToken: accessToken },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSellerApplicationKeys.all,
      });
    },
  });
}

export function useRejectSellerApplication(): UseMutationResult<
  void,
  Error,
  { applicationId: number; reason: string }
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, reason }) =>
      apiFetch<void>(`/api/admin/seller/applications/${applicationId}/reject`, {
        method: 'POST',
        body: { reason },
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSellerApplicationKeys.all,
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Admin — Banners
// ─────────────────────────────────────────────────────────────

type BannerListParams = { status?: BannerStatus | null };

export const adminBannerKeys = {
  all: ['admin', 'banners'] as const,
  list: (params: BannerListParams) =>
    [...adminBannerKeys.all, 'list', params] as const,
};

export function useAdminBanners(
  params: BannerListParams = {},
): UseQueryResult<Banner[]> {
  const accessToken = useToken();
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  const query = search.toString();
  return useQuery({
    queryKey: adminBannerKeys.list(params),
    queryFn: () =>
      apiFetch<Banner[]>(`/api/admin/banners${query ? `?${query}` : ''}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}

export function useCreateBanner(): UseMutationResult<
  Banner,
  Error,
  BannerCreateRequest
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiFetch<Banner>('/api/admin/banners', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    },
  });
}

type UpdateBannerArgs = { bannerId: number } & BannerUpdateRequest;

export function useUpdateBanner(): UseMutationResult<
  Banner,
  Error,
  UpdateBannerArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bannerId, ...body }) =>
      apiFetch<Banner>(`/api/admin/banners/${bannerId}`, {
        method: 'PUT',
        body,
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    },
  });
}

export function usePublishBanner(): UseMutationResult<void, Error, number> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bannerId) =>
      apiFetch<void>(`/api/admin/banners/${bannerId}/publish`, {
        method: 'PATCH',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    },
  });
}

export function useDeleteBanner(): UseMutationResult<void, Error, number> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bannerId) =>
      apiFetch<void>(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Admin — Dashboard
// ─────────────────────────────────────────────────────────────

type DashboardParams = {
  startDate: string;
  endDate: string;
  unit?: 'DAILY' | 'MONTHLY';
};

export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  sales: (params: DashboardParams) =>
    [...adminDashboardKeys.all, 'sales', params] as const,
  refunds: (params: DashboardParams) =>
    [...adminDashboardKeys.all, 'refunds', params] as const,
  payments: (params: DashboardParams) =>
    [...adminDashboardKeys.all, 'payments', params] as const,
  salesStats: (params: DashboardParams) =>
    [...adminDashboardKeys.all, 'sales-stats', params] as const,
};

const buildDashboardSearch = (params: DashboardParams) => {
  const search = new URLSearchParams();
  search.set('startDate', params.startDate);
  search.set('endDate', params.endDate);
  if (params.unit) search.set('unit', params.unit);
  return search.toString();
};

export function useAdminSalesTimeSeries(
  params: DashboardParams,
): UseQueryResult<SalesTimeSeriesResponse> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminDashboardKeys.sales(params),
    queryFn: () =>
      apiFetch<SalesTimeSeriesResponse>(
        `/api/admin/dashboard/sales?${buildDashboardSearch(params)}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useAdminRefundsTimeSeries(
  params: DashboardParams,
): UseQueryResult<RefundsTimeSeriesResponse> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminDashboardKeys.refunds(params),
    queryFn: () =>
      apiFetch<RefundsTimeSeriesResponse>(
        `/api/admin/dashboard/refunds?${buildDashboardSearch(params)}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useAdminPaymentsTimeSeries(
  params: DashboardParams,
): UseQueryResult<PaymentsTimeSeriesResponse> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminDashboardKeys.payments(params),
    queryFn: () =>
      apiFetch<PaymentsTimeSeriesResponse>(
        `/api/admin/dashboard/payments?${buildDashboardSearch(params)}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken,
  });
}

export function useAdminSalesStats(
  params: DashboardParams,
): UseQueryResult<SalesStatsResponse> {
  const accessToken = useToken();
  const search = buildDashboardSearch(params);
  return useQuery({
    queryKey: adminDashboardKeys.salesStats(params),
    queryFn: () =>
      apiFetch<SalesStatsResponse>(`/api/admin/stats/sales?${search}`, {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
  });
}

export function useDeleteMember(): UseMutationResult<void, Error, number> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiFetch<void>(`/api/admin/members/${id}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all });
      queryClient.removeQueries({ queryKey: adminMemberKeys.detail(id) });
    },
  });
}

type BlacklistArgs = { memberId: number; blacklisted: boolean };

export function useSetBlacklist(): UseMutationResult<
  MemberAdmin,
  Error,
  BlacklistArgs
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, blacklisted }) =>
      apiFetch<MemberAdmin>(`/api/admin/members/${memberId}/blacklist`, {
        method: blacklisted ? 'POST' : 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (member) => {
      queryClient.setQueryData(adminMemberKeys.detail(member.id), member);
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

export const adminNotificationKeys = {
  all: ['admin', 'notifications'] as const,
  list: (params: { page?: number; size?: number }) =>
    [...adminNotificationKeys.all, 'list', params] as const,
  unreadCount: () => [...adminNotificationKeys.all, 'unread-count'] as const,
};

const DEFAULT_NOTIF_PAGE_SIZE = 20;
// 안 읽은 알림은 자주 변경되므로 짧은 staleTime
const UNREAD_COUNT_STALE_MS = 30_000;

export function useAdminNotifications(
  params: { page?: number; size?: number } = {},
): UseQueryResult<PageResponse<Notification>> {
  const accessToken = useToken();
  const search = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? DEFAULT_NOTIF_PAGE_SIZE),
  }).toString();
  return useQuery({
    queryKey: adminNotificationKeys.list(params),
    queryFn: () =>
      apiFetch<PageResponse<Notification>>(
        `/api/admin/notifications?${search}`,
        {
          authToken: accessToken,
        },
      ),
    enabled: !!accessToken,
  });
}

export function useAdminUnreadCount(): UseQueryResult<{ count: number }> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminNotificationKeys.unreadCount(),
    queryFn: () =>
      apiFetch<{ count: number }>('/api/admin/notifications/unread-count', {
        authToken: accessToken,
      }),
    enabled: !!accessToken,
    staleTime: UNREAD_COUNT_STALE_MS,
  });
}

export function useMarkNotificationRead(): UseMutationResult<
  void,
  Error,
  number
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiFetch<void>(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead(): UseMutationResult<
  void,
  Error,
  void
> {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/admin/notifications/read-all', {
        method: 'PATCH',
        authToken: accessToken,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Stock histories
// ─────────────────────────────────────────────────────────────

type StockHistoryParams = {
  skuId?: number | null;
  changeType?: StockChangeType | null;
  page?: number;
  size?: number;
};

export const adminStockHistoryKeys = {
  all: ['admin', 'stock-histories'] as const,
  list: (productId: number, params: StockHistoryParams) =>
    [...adminStockHistoryKeys.all, productId, params] as const,
};

const DEFAULT_HISTORY_PAGE_SIZE = 20;

const buildHistorySearch = (params: StockHistoryParams) => {
  const search = new URLSearchParams();
  if (params.skuId) search.set('skuId', String(params.skuId));
  if (params.changeType) search.set('changeType', params.changeType);
  search.set('page', String(params.page ?? 0));
  search.set('size', String(params.size ?? DEFAULT_HISTORY_PAGE_SIZE));
  return search.toString();
};

export function useAdminStockHistories(
  productId: number,
  params: StockHistoryParams = {},
): UseQueryResult<PageResponse<StockHistory>> {
  const accessToken = useToken();
  return useQuery({
    queryKey: adminStockHistoryKeys.list(productId, params),
    queryFn: () =>
      apiFetch<PageResponse<StockHistory>>(
        `/api/admin/products/${productId}/stock-histories?${buildHistorySearch(params)}`,
        { authToken: accessToken },
      ),
    enabled: !!accessToken && productId > 0,
  });
}
