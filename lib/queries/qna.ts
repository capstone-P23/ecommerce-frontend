// 상품 Q&A queryKey
export const qnaKeys = {
  all: ['qna'] as const,
  byProduct: (productId: string | number) =>
    [...qnaKeys.all, 'product', String(productId)] as const,
};
