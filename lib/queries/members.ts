// 마이페이지 - 혜택 / 좋아요 / 찜 / 최근 본 상품 queryKey
export const memberKeys = {
  all: ['members'] as const,
  benefits: () => [...memberKeys.all, 'benefits'] as const,
  wishlist: () => [...memberKeys.all, 'wishlist'] as const,
  recentlyViewed: () => [...memberKeys.all, 'recently-viewed'] as const,
  likes: (productId: string | number) =>
    [...memberKeys.all, 'likes', String(productId)] as const,
};
