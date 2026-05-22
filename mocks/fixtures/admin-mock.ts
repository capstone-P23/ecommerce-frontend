// Admin mock-only state (phase 7c).
// 백엔드 endpoint 가 추가되면 이 파일 삭제 + handlers/queries 정렬.

import type {
  AdminBanner,
  AdminDashboardStats,
  SecurityLog,
  SellerApplication,
  SellerApplicationStatus,
  SellerGrade,
  SettlementPolicy,
} from '@/types/api';

const isoHoursAgo = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
};
const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const KRW = 'KRW';

export const adminMockState = {
  stats: {
    grossSales: 423_000_000,
    currency: KRW,
    totalOrders: 8430,
    totalMembers: 12_450,
    activeSellers: 64,
    unreadNotifications: 2,
  } satisfies AdminDashboardStats,

  sellers: [
    {
      id: 10,
      brandName: '데모 스토어',
      representativeName: '김대표',
      email: 'demo-store@example.com',
      appliedAt: isoDaysAgo(60),
      status: 'APPROVED',
      grade: 'SILVER',
    },
    {
      id: 11,
      brandName: '베타 스토어',
      representativeName: '이베타',
      email: 'beta@example.com',
      appliedAt: isoDaysAgo(7),
      status: 'PENDING',
      grade: null,
    },
    {
      id: 12,
      brandName: '의심상점',
      representativeName: '박의심',
      email: 'sus@example.com',
      appliedAt: isoDaysAgo(20),
      status: 'REJECTED',
      grade: null,
    },
    {
      id: 13,
      brandName: '커피팩토리',
      representativeName: '정커피',
      email: 'coffee@example.com',
      appliedAt: isoDaysAgo(180),
      status: 'APPROVED',
      grade: 'GOLD',
    },
  ] as SellerApplication[],

  policy: {
    commissionRate: 0.05,
    cycle: 'MONTHLY',
    minimumPayout: 10_000,
    currency: KRW,
  } satisfies SettlementPolicy,

  banners: [
    {
      bannerId: 1,
      title: '봄 신상품 모음',
      imageUrl: 'https://picsum.photos/seed/spring/1200/300',
      linkUrl: '/consumer/demo-store/products?categoryId=1',
      active: true,
      displayOrder: 1,
    },
    {
      bannerId: 2,
      title: '여름 음료 특가',
      imageUrl: 'https://picsum.photos/seed/summer/1200/300',
      linkUrl: '/consumer/demo-store/products?categoryId=2',
      active: true,
      displayOrder: 2,
    },
    {
      bannerId: 3,
      title: '겨울 캠페인 (보류)',
      imageUrl: 'https://picsum.photos/seed/winter/1200/300',
      linkUrl: '/consumer/demo-store',
      active: false,
      displayOrder: 99,
    },
  ] as AdminBanner[],

  securityLogs: [
    {
      logId: 1,
      type: 'LOGIN_FAILURE',
      actorEmail: 'unknown@example.com',
      ipAddress: '192.168.0.10',
      message: '비밀번호 5회 실패',
      occurredAt: isoHoursAgo(2),
    },
    {
      logId: 2,
      type: 'PERMISSION_DENIED',
      actorEmail: 'demo@user.com',
      ipAddress: '203.0.113.42',
      message: 'admin endpoint 호출 시도 (권한 없음)',
      occurredAt: isoHoursAgo(8),
    },
    {
      logId: 3,
      type: 'SUSPICIOUS_REQUEST',
      ipAddress: '198.51.100.7',
      message: '비정상적인 페이지 요청 패턴',
      occurredAt: isoDaysAgo(1),
    },
  ] as SecurityLog[],
};

// ─── seller ─────────────────────────────────────────────────
export function setSellerStatus(
  id: number,
  status: SellerApplicationStatus,
): SellerApplication | undefined {
  const seller = adminMockState.sellers.find((s) => s.id === id);
  if (!seller) return undefined;
  seller.status = status;
  if (status !== 'APPROVED') seller.grade = null;
  return seller;
}

export function setSellerGrade(
  id: number,
  grade: SellerGrade,
): SellerApplication | undefined {
  const seller = adminMockState.sellers.find((s) => s.id === id);
  if (!seller || seller.status !== 'APPROVED') return undefined;
  seller.grade = grade;
  return seller;
}

// ─── policy ─────────────────────────────────────────────────
export function updatePolicy(input: Partial<SettlementPolicy>): SettlementPolicy {
  Object.assign(adminMockState.policy, input);
  return adminMockState.policy;
}

// ─── banner ─────────────────────────────────────────────────
export function toggleBannerActive(id: number): AdminBanner | undefined {
  const banner = adminMockState.banners.find((b) => b.bannerId === id);
  if (!banner) return undefined;
  banner.active = !banner.active;
  return banner;
}
