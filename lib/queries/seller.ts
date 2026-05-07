// 판매자 도메인 queryKey
export const sellerKeys = {
  all: ['seller'] as const,
  stats: () => [...sellerKeys.all, 'stats'] as const,
  members: () => [...sellerKeys.all, 'members'] as const,
  products: () => [...sellerKeys.all, 'products'] as const,
  productOptions: (productId: string | number) =>
    [...sellerKeys.all, 'products', String(productId), 'options'] as const,
  orders: () => [...sellerKeys.all, 'orders'] as const,
  stock: () => [...sellerKeys.all, 'stock'] as const,
  settlement: () => [...sellerKeys.all, 'settlement'] as const,
  cs: () => [...sellerKeys.all, 'cs'] as const,
};
