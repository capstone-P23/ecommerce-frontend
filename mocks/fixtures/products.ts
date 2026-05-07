// 상품 픽스처 — Phase 5 에서 화면에 사용
export type Product = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  categoryId: number;
  storeDomain: string;
  description: string;
};

export const mockProducts: Product[] = [
  {
    id: 1,
    name: '오가닉 망고',
    price: 12000,
    thumbnail: '/placeholder/mango.jpg',
    categoryId: 1,
    storeDomain: 'demo-store',
    description: '필리핀 직배송 오가닉 망고. 당도 18 이상 보장.',
  },
  {
    id: 2,
    name: '아보카도 6개',
    price: 18900,
    thumbnail: '/placeholder/avocado.jpg',
    categoryId: 1,
    storeDomain: 'demo-store',
    description: '바로 먹기 좋은 후숙 완료 아보카도.',
  },
  {
    id: 3,
    name: '에티오피아 예가체프 200g',
    price: 16500,
    thumbnail: '/placeholder/coffee.jpg',
    categoryId: 2,
    storeDomain: 'demo-store',
    description: '플로럴 + 시트러스 노트의 싱글 오리진 원두.',
  },
  {
    id: 4,
    name: '핸드드립 세트',
    price: 89000,
    thumbnail: '/placeholder/dripper.jpg',
    categoryId: 3,
    storeDomain: 'demo-store',
    description: '하리오 드리퍼 + 서버 + 드립 케틀 세트.',
  },
  {
    id: 5,
    name: '유기농 오트밀 1kg',
    price: 9800,
    thumbnail: '/placeholder/oat.jpg',
    categoryId: 1,
    storeDomain: 'demo-store',
    description: '무가당 통곡물 오트밀.',
  },
];

export const mockCategories = [
  { id: 1, name: '식품' },
  { id: 2, name: '음료' },
  { id: 3, name: '주방용품' },
];
