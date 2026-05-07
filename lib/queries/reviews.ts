// 리뷰 도메인 queryKey
export const reviewKeys = {
  all: ['reviews'] as const,
  byProduct: (productId: string | number) =>
    [...reviewKeys.all, 'product', String(productId)] as const,
};
