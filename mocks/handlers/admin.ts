import { http, HttpResponse } from 'msw';

import type {
  AddSkuRequest,
  AdjustStockRequest,
  Banner,
  BannerCreateRequest,
  BannerStatus,
  BannerUpdateRequest,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductCreateRequest,
  ProductUpdateRequest,
  PaymentsTimeSeriesResponse,
  RefundsTimeSeriesResponse,
  SalesStatsResponse,
  SalesTimeSeriesResponse,
  SellerApplicationAdmin,
  SellerApplicationStatus,
} from '@/types/api';

import type {
  PageResponse,
  MemberAdmin,
  Notification,
  StockHistory,
} from '@/types/api';

import {
  addSku,
  createCategory,
  createProduct,
  decreaseSkuStock,
  discontinueProduct,
  increaseSkuStock,
  removeSku,
  updateCategory,
  updateProduct,
} from '../fixtures/admin-products';
import {
  deleteMember,
  findMember,
  markAllAsRead,
  markAsRead,
  setBlacklist,
  snapshotMembers,
  snapshotStockHistories,
  unreadCount,
  adminNotificationsState,
} from '../fixtures/admin-members';

/**
 * Admin 핸들러 — 백엔드 api-docs.json 정렬.
 *
 * 상품:
 *   POST   *​/api/admin/products
 *   PATCH  *​/api/admin/products/{id}
 *   DELETE *​/api/admin/products/{id}                                   (단종)
 *   POST   *​/api/admin/products/{productId}/skus
 *   DELETE *​/api/admin/products/{productId}/skus/{skuId}
 *   POST   *​/api/admin/products/{productId}/skus/{skuId}/stock/increase
 *   POST   *​/api/admin/products/{productId}/skus/{skuId}/stock/decrease
 *
 * 카테고리:
 *   POST   *​/api/admin/categories
 *   PATCH  *​/api/admin/categories/{id}
 *
 * 회원 / 알림 / 재고 이력 endpoint 는 phase 7b 에서 추가.
 */
export const adminHandlers = [
  // ─── Banners ───────────────────────────────────────────────
  http.get('*/api/admin/banners', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as BannerStatus | null;
    const list = status
      ? bannerState.list.filter((item) => item.status === status)
      : bannerState.list;
    return HttpResponse.json(list);
  }),

  http.post('*/api/admin/banners', async ({ request }) => {
    const body = (await request.json()) as BannerCreateRequest;
    if (!body?.name || !body?.imageUrl || !body?.startAt || !body?.endAt) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    const nextId = bannerState.nextId++;
    const banner: Banner = {
      bannerId: nextId,
      name: body.name,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl ?? '',
      startAt: body.startAt,
      endAt: body.endAt,
      displayOrder: body.displayOrder ?? 0,
      status: 'DRAFT',
    };
    bannerState.list = [...bannerState.list, banner];
    return HttpResponse.json(banner, { status: 201 });
  }),

  http.put('*/api/admin/banners/:bannerId', async ({ params, request }) => {
    const body = (await request.json()) as BannerUpdateRequest;
    const bannerId = Number(params.bannerId);
    const index = bannerState.list.findIndex(
      (item) => item.bannerId === bannerId,
    );
    if (index < 0)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    const prev = bannerState.list[index];
    const updated: Banner = {
      ...prev,
      name: body.name,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl ?? '',
      startAt: body.startAt,
      endAt: body.endAt,
      displayOrder: body.displayOrder,
    };
    bannerState.list[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete('*/api/admin/banners/:bannerId', ({ params }) => {
    const bannerId = Number(params.bannerId);
    const prev = bannerState.list.length;
    bannerState.list = bannerState.list.filter(
      (item) => item.bannerId !== bannerId,
    );
    if (bannerState.list.length === prev) {
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.patch('*/api/admin/banners/:bannerId/publish', ({ params }) => {
    const bannerId = Number(params.bannerId);
    const banner = bannerState.list.find((item) => item.bannerId === bannerId);
    if (!banner)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    banner.status = 'PUBLISHED';
    return new HttpResponse(null, { status: 200 });
  }),

  // ─── Seller Applications ───────────────────────────────────
  http.get('*/api/admin/seller/applications', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get(
      'status',
    ) as SellerApplicationStatus | null;
    const list = status
      ? sellerApplicationState.list.filter((item) => item.status === status)
      : sellerApplicationState.list;
    return HttpResponse.json(list);
  }),

  http.post(
    '*/api/admin/seller/applications/:applicationId/approve',
    ({ params }) => {
      const applicationId = Number(params.applicationId);
      const item = sellerApplicationState.list.find(
        (seller) => seller.applicationId === applicationId,
      );
      if (!item)
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      item.status = 'APPROVED';
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.post(
    '*/api/admin/seller/applications/:applicationId/reject',
    ({ params }) => {
      const applicationId = Number(params.applicationId);
      const item = sellerApplicationState.list.find(
        (seller) => seller.applicationId === applicationId,
      );
      if (!item)
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      item.status = 'REJECTED';
      return new HttpResponse(null, { status: 200 });
    },
  ),

  // ─── Dashboard ─────────────────────────────────────────────
  http.get('*/api/admin/dashboard/sales', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const response = buildSalesTimeSeries(params);
    if (!response) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/dashboard/refunds', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const response = buildRefundsTimeSeries(params);
    if (!response) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/dashboard/payments', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const response = buildPaymentsTimeSeries(params);
    if (!response) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/stats/sales', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    if (!startDate || !endDate) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(salesStatsState);
  }),

  // Products
  http.post('*/api/admin/products', async ({ request }) => {
    const body = (await request.json()) as ProductCreateRequest;
    if (!body?.name || !body?.categoryId) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(createProduct(body), { status: 201 });
  }),

  http.patch('*/api/admin/products/:id', async ({ params, request }) => {
    const body = (await request.json()) as ProductUpdateRequest;
    const product = updateProduct(Number(params.id), body);
    if (!product)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.delete('*/api/admin/products/:id', ({ params }) => {
    const ok = discontinueProduct(Number(params.id));
    if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  // SKU
  http.post(
    '*/api/admin/products/:productId/skus',
    async ({ params, request }) => {
      const body = (await request.json()) as AddSkuRequest;
      if (!body?.options?.length || body.initialStock == null) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
      }
      const sku = addSku(Number(params.productId), body);
      if (!sku)
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return HttpResponse.json(sku, { status: 201 });
    },
  ),

  http.delete('*/api/admin/products/:productId/skus/:skuId', ({ params }) => {
    const ok = removeSku(Number(params.productId), Number(params.skuId));
    if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(
    '*/api/admin/products/:productId/skus/:skuId/stock/increase',
    async ({ params, request }) => {
      const body = (await request.json()) as AdjustStockRequest;
      if (!body?.quantity || body.quantity < 1) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
      }
      const result = increaseSkuStock(
        Number(params.productId),
        Number(params.skuId),
        body,
      );
      if (!result)
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return HttpResponse.json({ currentStock: result.sku.stock });
    },
  ),

  http.post(
    '*/api/admin/products/:productId/skus/:skuId/stock/decrease',
    async ({ params, request }) => {
      const body = (await request.json()) as AdjustStockRequest;
      if (!body?.quantity || body.quantity < 1) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
      }
      const result = decreaseSkuStock(
        Number(params.productId),
        Number(params.skuId),
        body,
      );
      if (!result)
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      return HttpResponse.json({ currentStock: result.sku.stock });
    },
  ),

  // Category
  http.post('*/api/admin/categories', async ({ request }) => {
    const body = (await request.json()) as CategoryCreateRequest;
    if (!body?.name || !body?.slug) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 });
    }
    return HttpResponse.json(createCategory(body), { status: 201 });
  }),

  http.patch('*/api/admin/categories/:id', async ({ params, request }) => {
    const body = (await request.json()) as CategoryUpdateRequest;
    const category = updateCategory(Number(params.id), body);
    if (!category)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(category);
  }),

  // ─── Member ────────────────────────────────────────────────
  http.get('*/api/admin/members', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const all = snapshotMembers({ status, keyword });
    const start = page * size;
    const slice = all.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(all.length / size));
    const response: PageResponse<MemberAdmin> = {
      content: slice,
      totalElements: all.length,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: slice.length,
      empty: slice.length === 0,
    };
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/members/:memberId', ({ params }) => {
    const member = findMember(Number(params.memberId));
    if (!member)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  http.delete('*/api/admin/members/:memberId', ({ params }) => {
    const ok = deleteMember(Number(params.memberId));
    if (!ok) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/api/admin/members/:memberId/blacklist', ({ params }) => {
    const member = setBlacklist(Number(params.memberId), true);
    if (!member)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  http.delete('*/api/admin/members/:memberId/blacklist', ({ params }) => {
    const member = setBlacklist(Number(params.memberId), false);
    if (!member)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(member);
  }),

  // ─── Notifications ─────────────────────────────────────────
  http.get('*/api/admin/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const all = adminNotificationsState.list;
    const start = page * size;
    const slice = all.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(all.length / size));
    const response: PageResponse<Notification> = {
      content: slice,
      totalElements: all.length,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: slice.length,
      empty: slice.length === 0,
    };
    return HttpResponse.json(response);
  }),

  http.get('*/api/admin/notifications/unread-count', () =>
    HttpResponse.json({ count: unreadCount() }),
  ),

  http.patch('*/api/admin/notifications/:id/read', ({ params }) => {
    const item = markAsRead(Number(params.id));
    if (!item)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),

  http.patch('*/api/admin/notifications/read-all', () => {
    markAllAsRead();
    return new HttpResponse(null, { status: 200 });
  }),

  // ─── Stock histories (per product) ─────────────────────────
  http.get(
    '*/api/admin/products/:productId/stock-histories',
    ({ params, request }) => {
      const url = new URL(request.url);
      const skuIdParam = url.searchParams.get('skuId');
      const changeType = url.searchParams.get('changeType');
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 20);

      const all = snapshotStockHistories(Number(params.productId), {
        skuId: skuIdParam ? Number(skuIdParam) : null,
        changeType,
      });
      const start = page * size;
      const slice = all.slice(start, start + size);
      const totalPages = Math.max(1, Math.ceil(all.length / size));
      const response: PageResponse<StockHistory> = {
        content: slice,
        totalElements: all.length,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
        numberOfElements: slice.length,
        empty: slice.length === 0,
      };
      return HttpResponse.json(response);
    },
  ),
];

const bannerState: { list: Banner[]; nextId: number } = {
  nextId: 4,
  list: [
    {
      bannerId: 1,
      name: '여름 시즌 기획전',
      imageUrl: 'https://placehold.co/640x240?text=Banner+1',
      linkUrl: 'https://example.com/campaign/summer',
      startAt: '2026-06-01T09:00:00',
      endAt: '2026-06-30T23:59:59',
      displayOrder: 1,
      status: 'PUBLISHED',
    },
    {
      bannerId: 2,
      name: '신규 입점 기념',
      imageUrl: 'https://placehold.co/640x240?text=Banner+2',
      linkUrl: 'https://example.com/campaign/new',
      startAt: '2026-06-10T09:00:00',
      endAt: '2026-07-10T23:59:59',
      displayOrder: 2,
      status: 'SCHEDULED',
    },
    {
      bannerId: 3,
      name: '마감 세일',
      imageUrl: 'https://placehold.co/640x240?text=Banner+3',
      linkUrl: 'https://example.com/campaign/clearance',
      startAt: '2026-05-01T09:00:00',
      endAt: '2026-05-31T23:59:59',
      displayOrder: 3,
      status: 'EXPIRED',
    },
  ],
};

const sellerApplicationState: { list: SellerApplicationAdmin[] } = {
  list: [
    { applicationId: 1001, status: 'PENDING' },
    { applicationId: 1002, status: 'APPROVED' },
    { applicationId: 1003, status: 'REJECTED' },
    { applicationId: 1004, status: 'PENDING' },
  ],
};

const salesStatsState: SalesStatsResponse = {
  totalRevenue: 12500000,
  currency: 'KRW',
  orderCount: 842,
  cancelCount: 41,
  popularProducts: [
    {
      productId: 101,
      productName: '아로마 디퓨저',
      totalSoldQuantity: 320,
      totalRevenue: 3840000,
    },
    {
      productId: 102,
      productName: '실내 슬리퍼',
      totalSoldQuantity: 210,
      totalRevenue: 1890000,
    },
    {
      productId: 103,
      productName: '우드 트레이',
      totalSoldQuantity: 142,
      totalRevenue: 1136000,
    },
  ],
};

const buildSalesTimeSeries = (
  params: URLSearchParams,
): SalesTimeSeriesResponse | null => {
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  const unit = (params.get('unit') ?? 'DAILY') as 'DAILY' | 'MONTHLY';
  if (!startDate || !endDate) return null;
  const dates = buildDateSeries(startDate, endDate, unit);
  if (!dates.length) return null;
  const items = dates.map((date, index) => ({
    date,
    revenue: 100000 + index * 8000,
    orderCount: 18 + index,
  }));
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrderCount = items.reduce((sum, item) => sum + item.orderCount, 0);
  return {
    unit,
    startDate,
    endDate,
    items,
    totalRevenue,
    totalOrderCount,
  };
};

const buildRefundsTimeSeries = (
  params: URLSearchParams,
): RefundsTimeSeriesResponse | null => {
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  const unit = (params.get('unit') ?? 'DAILY') as 'DAILY' | 'MONTHLY';
  if (!startDate || !endDate) return null;
  const dates = buildDateSeries(startDate, endDate, unit);
  if (!dates.length) return null;
  const items = dates.map((date, index) => ({
    date,
    refundCount: 2 + (index % 3),
    refundAmount: 12000 + index * 800,
  }));
  const totalRefundCount = items.reduce(
    (sum, item) => sum + item.refundCount,
    0,
  );
  const totalRefundAmount = items.reduce(
    (sum, item) => sum + item.refundAmount,
    0,
  );
  return {
    unit,
    startDate,
    endDate,
    items,
    totalRefundCount,
    totalRefundAmount,
  };
};

const buildPaymentsTimeSeries = (
  params: URLSearchParams,
): PaymentsTimeSeriesResponse | null => {
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  const unit = (params.get('unit') ?? 'DAILY') as 'DAILY' | 'MONTHLY';
  if (!startDate || !endDate) return null;
  const dates = buildDateSeries(startDate, endDate, unit);
  if (!dates.length) return null;
  const items = dates.map((date, index) => {
    const paymentCount = 20 + index;
    const totalAmount = 150000 + index * 9000;
    return {
      date,
      paymentCount,
      totalAmount,
      averageAmount: Math.round(totalAmount / paymentCount),
    };
  });
  const totalPaymentCount = items.reduce(
    (sum, item) => sum + item.paymentCount,
    0,
  );
  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageAmount = Math.round(
    totalAmount / Math.max(totalPaymentCount, 1),
  );
  return {
    unit,
    startDate,
    endDate,
    items,
    totalPaymentCount,
    totalAmount,
    averageAmount,
  };
};

const buildDateSeries = (
  start: string,
  end: string,
  unit: 'DAILY' | 'MONTHLY',
): string[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    return [];
  if (startDate > endDate) return [];
  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const iso = cursor.toISOString().slice(0, 10);
    dates.push(iso);
    if (unit === 'MONTHLY') {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1);
    } else {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return dates;
};
