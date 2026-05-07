// 주문 픽스처
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type Order = {
  id: number;
  userId: number;
  productIds: number[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
};

export const mockOrders: Order[] = [
  {
    id: 1001,
    userId: 1,
    productIds: [1, 5],
    totalPrice: 21800,
    status: 'shipped',
    createdAt: '2026-04-25T10:30:00Z',
    trackingNumber: 'CJ123456789',
  },
  {
    id: 1002,
    userId: 1,
    productIds: [3],
    totalPrice: 16500,
    status: 'delivered',
    createdAt: '2026-04-15T14:22:00Z',
    trackingNumber: 'CJ987654321',
  },
  {
    id: 1003,
    userId: 1,
    productIds: [2],
    totalPrice: 18900,
    status: 'pending',
    createdAt: '2026-04-30T09:00:00Z',
  },
];
