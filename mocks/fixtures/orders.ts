// 주문 in-memory 상태. 사용자가 주문 생성 시 여기 누적됨.
// dev 세션 동안만 유지, 서버 재시작 시 초기화.

import type {
  CreateOrderRequest,
  OrderDetail,
  OrderItem,
} from '@/types/api';

import { mockProductSummaries } from './products';

const buildOrderItem = (
  productId: number,
  quantity: number,
): OrderItem | null => {
  const product = mockProductSummaries.find((p) => p.id === productId);
  if (!product) return null;
  return {
    productId,
    productName: product.name,
    priceAmount: product.price,
    currency: product.currency,
    productImageUrl: product.mainImageUrl,
    quantity,
    subtotal: product.price * quantity,
  };
};

const generateOrderNumber = () =>
  `ORD-${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;

export const orderState = {
  orders: [] as OrderDetail[],
};

export function snapshotMyOrders() {
  return [...orderState.orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function findOrderByNumber(orderNumber: string): OrderDetail | undefined {
  return orderState.orders.find((o) => o.orderNumber === orderNumber);
}

export function createOrder(input: CreateOrderRequest): OrderDetail {
  const items = input.items
    .map(({ productId, quantity }) => buildOrderItem(productId, quantity))
    .filter((x): x is OrderItem => x !== null);

  const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
  const currency = items[0]?.currency ?? 'KRW';

  const order: OrderDetail = {
    orderNumber: generateOrderNumber(),
    status: 'PENDING',
    totalAmount,
    currency,
    items,
    delivery: input.delivery,
    createdAt: new Date().toISOString(),
  };

  orderState.orders.unshift(order);
  return order;
}

export function cancelOrder(orderNumber: string): OrderDetail | undefined {
  const target = orderState.orders.find((o) => o.orderNumber === orderNumber);
  if (!target || target.status === 'CANCELLED') return target;
  target.status = 'CANCELLED';
  target.cancelledAt = new Date().toISOString();
  return target;
}

/**
 * @deprecated phase 3 에서 만든 임시 export.
 * seller.ts 가 phase 6 에서 백엔드 스키마 정렬될 때까지 컴파일 보전용.
 */
export const mockOrders = orderState.orders;
