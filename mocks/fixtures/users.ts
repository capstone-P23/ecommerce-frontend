// 사용자 픽스처
export type UserRole = 'consumer' | 'seller' | 'admin';

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  points: number;
  coupons: number;
};

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'demo@user.com',
    name: '데모 소비자',
    role: 'consumer',
    points: 5400,
    coupons: 2,
  },
  {
    id: 2,
    email: 'seller@demo.com',
    name: '데모 판매자',
    role: 'seller',
    points: 0,
    coupons: 0,
  },
  {
    id: 3,
    email: 'admin@platform.com',
    name: '관리자',
    role: 'admin',
    points: 0,
    coupons: 0,
  },
];

export const mockSellers = [
  {
    id: 10,
    name: '데모 스토어',
    domain: 'demo-store',
    status: 'approved',
    grade: 'silver',
    appliedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 11,
    name: '베타 스토어',
    domain: 'beta-store',
    status: 'pending',
    grade: null,
    appliedAt: '2026-04-20T00:00:00Z',
  },
];
