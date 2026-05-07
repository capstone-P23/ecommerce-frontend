// 상품 도메인 queryKey 팩토리
// useQuery({ queryKey: productKeys.detail('1'), ... }) 형태로 사용
export const productKeys = {
  all: ['products'] as const,
  searches: () => [...productKeys.all, 'search'] as const,
  search: (keyword: string) => [...productKeys.searches(), keyword] as const,
  recommended: (userId: string) => [...productKeys.all, 'recommended', userId] as const,
  category: (categoryId: number) => [...productKeys.all, 'category', categoryId] as const,
  detail: (productId: string | number) => [...productKeys.all, 'detail', String(productId)] as const,
  compare: (ids: Array<string | number>) =>
    [...productKeys.all, 'compare', ids.map(String).sort().join(',')] as const,
};
