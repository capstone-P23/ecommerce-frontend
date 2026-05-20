/**
 * 백엔드 API 응답 타입.
 * 출처: api/api-docs.json (OpenAPI 3.1)
 *
 * 백엔드 스키마와 1:1 대응. 임의로 필드명 바꾸지 말 것.
 */

// ─────────────────────────────────────────────────────────────
// 공통
// ─────────────────────────────────────────────────────────────

/**
 * Spring Data Page 응답 (Pageable 결과).
 * 백엔드가 반환하는 PageXxxResponse 의 제네릭 버전.
 */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

// ─────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────

export type Category = {
  id: number;
  name: string;
  slug: string;
};

// ─────────────────────────────────────────────────────────────
// Product
// ─────────────────────────────────────────────────────────────

export type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DISCONTINUED';

/** GET /api/products 리스트 항목 */
export type ProductSummary = {
  id: number;
  name: string;
  price: number;
  currency: string;
  mainImageUrl: string;
  categoryName: string;
  status: ProductStatus;
  inStock: boolean;
  totalStock: number;
};

export type SkuOption = {
  name: string;
  value: string;
};

export type Sku = {
  skuId: number;
  skuCode: string;
  options: SkuOption[];
  stock: number;
  inStock: boolean;
};

/** GET /api/products/{id} 상세 */
export type ProductDetail = {
  id: number;
  name: string;
  price: number;
  currency: string;
  description: string;
  mainImageUrl: string;
  category: Category;
  status: ProductStatus;
  inStock: boolean;
  totalStock: number;
  skus: Sku[];
  createdAt: string;
};
