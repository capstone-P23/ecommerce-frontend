// 상품 / 카테고리 / SKU mock 데이터.
// 백엔드 응답 스키마(api-docs.json) 와 1:1 정렬.
import type { Category, ProductDetail, ProductSummary } from '@/types/api';

export const mockCategories: Category[] = [
  { id: 1, name: '식품', slug: 'food' },
  { id: 2, name: '음료', slug: 'beverage' },
  { id: 3, name: '주방용품', slug: 'kitchen' },
];

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/mango/600/600',
  'https://picsum.photos/seed/avocado/600/600',
  'https://picsum.photos/seed/coffee/600/600',
  'https://picsum.photos/seed/dripper/600/600',
  'https://picsum.photos/seed/oat/600/600',
];

export const mockProductSummaries: ProductSummary[] = [
  {
    id: 1,
    name: '오가닉 망고',
    price: 12000,
    currency: 'KRW',
    mainImageUrl: PLACEHOLDER_IMAGES[0],
    categoryName: '식품',
    status: 'ACTIVE',
    inStock: true,
    totalStock: 42,
  },
  {
    id: 2,
    name: '아보카도 6개',
    price: 18900,
    currency: 'KRW',
    mainImageUrl: PLACEHOLDER_IMAGES[1],
    categoryName: '식품',
    status: 'ACTIVE',
    inStock: true,
    totalStock: 18,
  },
  {
    id: 3,
    name: '에티오피아 예가체프 200g',
    price: 16500,
    currency: 'KRW',
    mainImageUrl: PLACEHOLDER_IMAGES[2],
    categoryName: '음료',
    status: 'ACTIVE',
    inStock: true,
    totalStock: 7,
  },
  {
    id: 4,
    name: '핸드드립 세트',
    price: 89000,
    currency: 'KRW',
    mainImageUrl: PLACEHOLDER_IMAGES[3],
    categoryName: '주방용품',
    status: 'SOLD_OUT',
    inStock: false,
    totalStock: 0,
  },
  {
    id: 5,
    name: '유기농 오트밀 1kg',
    price: 9800,
    currency: 'KRW',
    mainImageUrl: PLACEHOLDER_IMAGES[4],
    categoryName: '식품',
    status: 'ACTIVE',
    inStock: true,
    totalStock: 120,
  },
];

const summaryToDetail = (summary: ProductSummary): ProductDetail => {
  const category =
    mockCategories.find((c) => c.name === summary.categoryName) ?? mockCategories[0];

  return {
    id: summary.id,
    name: summary.name,
    price: summary.price,
    currency: summary.currency,
    description: `${summary.name} — Phase 5a mock 데이터. 백엔드 연결 후 실제 description 으로 교체됨.`,
    mainImageUrl: summary.mainImageUrl,
    category,
    status: summary.status,
    inStock: summary.inStock,
    totalStock: summary.totalStock,
    skus:
      summary.totalStock > 0
        ? [
            {
              skuId: summary.id * 100 + 1,
              skuCode: `SKU-${summary.id}-DEFAULT`,
              options: [],
              stock: summary.totalStock,
              inStock: summary.inStock,
            },
          ]
        : [],
    createdAt: '2026-05-01T00:00:00Z',
  };
};

export const mockProductDetails: ProductDetail[] = mockProductSummaries.map(summaryToDetail);

/**
 * @deprecated Phase 3 에서 만든 임시 export. 새 코드는 mockProductSummaries 사용.
 * orders / members / seller 핸들러가 아직 백엔드 스키마 정렬 안 됐을 때
 * 컴파일을 유지하기 위한 호환 alias. 해당 도메인이 Phase 5b/6 에서 재작성되면 제거.
 */
export const mockProducts = mockProductSummaries;
