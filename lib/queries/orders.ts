// 장바구니 / 주문 / 결제 도메인 queryKey
export const cartKeys = {
  all: ['cart'] as const,
  list: () => [...cartKeys.all, 'list'] as const,
};

export const orderKeys = {
  all: ['orders'] as const,
  list: (userId: string) => [...orderKeys.all, 'list', userId] as const,
  detail: (orderId: string | number) => [...orderKeys.all, 'detail', String(orderId)] as const,
};
