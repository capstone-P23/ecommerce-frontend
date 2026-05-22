// Admin — members / notifications / stock-history in-memory state.
import type { MemberAdmin, Notification, StockHistory } from '@/types/api';

const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const adminMembersState = {
  members: [
    {
      id: 1,
      email: 'demo@user.com',
      name: '데모 사용자',
      picture: undefined,
      status: 'ACTIVE',
      role: 'USER',
      emailVerified: true,
      createdAt: isoDaysAgo(120),
    },
    {
      id: 2,
      email: 'admin@platform.com',
      name: '관리자',
      status: 'ACTIVE',
      role: 'ADMIN',
      emailVerified: true,
      createdAt: isoDaysAgo(300),
    },
    {
      id: 3,
      email: 'spammer@example.com',
      name: '의심 계정',
      status: 'SUSPENDED',
      role: 'USER',
      emailVerified: false,
      createdAt: isoDaysAgo(15),
    },
    {
      id: 4,
      email: 'pending@example.com',
      name: '신규 가입',
      status: 'PENDING',
      role: 'USER',
      emailVerified: false,
      createdAt: isoDaysAgo(1),
    },
  ] as MemberAdmin[],
};

export function snapshotMembers(filters: {
  status?: string | null;
  keyword?: string | null;
}) {
  const { status, keyword } = filters;
  return adminMembersState.members.filter((m) => {
    const matchStatus = !status || m.status === status;
    const matchKeyword =
      !keyword ||
      m.email.includes(keyword) ||
      m.name.includes(keyword);
    return matchStatus && matchKeyword;
  });
}

export function findMember(id: number) {
  return adminMembersState.members.find((m) => m.id === id);
}

export function deleteMember(id: number) {
  const before = adminMembersState.members.length;
  adminMembersState.members = adminMembersState.members.filter((m) => m.id !== id);
  return adminMembersState.members.length < before;
}

export function setBlacklist(id: number, blacklisted: boolean) {
  const member = findMember(id);
  if (!member) return undefined;
  member.status = blacklisted ? 'SUSPENDED' : 'ACTIVE';
  return member;
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────

export const adminNotificationsState = {
  list: [
    {
      id: 1,
      type: 'SOLD_OUT',
      productId: 4,
      productName: '핸드드립 세트',
      skuId: 401,
      skuCode: 'SKU-4-DEFAULT',
      skuOptionsSnapshot: '기본',
      isRead: false,
      occurredAt: isoDaysAgo(0),
    },
    {
      id: 2,
      type: 'SOLD_OUT',
      productId: 3,
      productName: '에티오피아 예가체프 200g',
      skuId: 301,
      skuCode: 'SKU-3-DEFAULT',
      skuOptionsSnapshot: '기본',
      isRead: false,
      occurredAt: isoDaysAgo(2),
    },
    {
      id: 3,
      type: 'SOLD_OUT',
      productId: 2,
      productName: '아보카도 6개',
      skuId: 201,
      skuCode: 'SKU-2-DEFAULT',
      skuOptionsSnapshot: '기본',
      isRead: true,
      occurredAt: isoDaysAgo(7),
    },
  ] as Notification[],
};

export function markAsRead(id: number) {
  const item = adminNotificationsState.list.find((n) => n.id === id);
  if (item) item.isRead = true;
  return item;
}

export function markAllAsRead() {
  adminNotificationsState.list.forEach((n) => {
    n.isRead = true;
  });
}

export function unreadCount() {
  return adminNotificationsState.list.filter((n) => !n.isRead).length;
}

// ─────────────────────────────────────────────────────────────
// Stock histories (per product)
// ─────────────────────────────────────────────────────────────

export const adminStockHistoriesState = {
  byProduct: new Map<number, StockHistory[]>([
    [
      1,
      [
        {
          id: 1,
          productId: 1,
          productName: '오가닉 망고',
          skuId: 101,
          skuCode: 'SKU-1-DEFAULT',
          skuOptionsSnapshot: '기본',
          changeType: 'SKU_CREATED',
          quantity: 50,
          stockBefore: 0,
          stockAfter: 50,
          occurredAt: isoDaysAgo(30),
        },
        {
          id: 2,
          productId: 1,
          productName: '오가닉 망고',
          skuId: 101,
          skuCode: 'SKU-1-DEFAULT',
          skuOptionsSnapshot: '기본',
          changeType: 'ORDER',
          quantity: 8,
          stockBefore: 50,
          stockAfter: 42,
          orderId: 1001,
          occurredAt: isoDaysAgo(5),
        },
      ],
    ],
  ]),
};

export function snapshotStockHistories(
  productId: number,
  filters: { skuId?: number | null; changeType?: string | null },
) {
  const all = adminStockHistoriesState.byProduct.get(productId) ?? [];
  return all.filter((h) => {
    const matchSku = !filters.skuId || h.skuId === filters.skuId;
    const matchType = !filters.changeType || h.changeType === filters.changeType;
    return matchSku && matchType;
  });
}
