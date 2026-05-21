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

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────

export type CartItem = {
  itemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  currentPrice: number;
  currency: string;
  quantity: number;
  subtotal: number;
  /** 재고/상태 변동으로 더 이상 살 수 없는 항목 */
  available: boolean;
};

export type Cart = {
  cartId: number;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  itemCount: number;
  totalQuantity: number;
};

export type AddCartItemRequest = {
  productId: number;
  skuId: number;
  /** minimum: 1 (OpenAPI 제약) */
  quantity: number;
};

export type UpdateCartItemRequest = {
  /** minimum: 1 (OpenAPI 제약) — 0 으로 만들고 싶으면 DELETE 사용 */
  quantity: number;
};

// ─────────────────────────────────────────────────────────────
// Order
// ─────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CANCELLED';

/** GET /api/orders/me 의 목록 원소 */
export type Order = {
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
};

export type OrderItem = {
  productId: number;
  productName: string;
  priceAmount: number;
  currency: string;
  productImageUrl: string;
  quantity: number;
  subtotal: number;
};

export type DeliveryInfo = {
  receiverName: string;
  receiverPhone: string;
  zipCode: string;
  addressLine1: string;
  addressLine2?: string;
  memo?: string;
};

export type OrderDetail = {
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  delivery: DeliveryInfo;
  createdAt: string;
  cancelledAt?: string;
};

/** POST /api/orders/me 요청의 items 원소 */
export type OrderItemRequest = {
  productId: number;
  skuId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: OrderItemRequest[];
  delivery: DeliveryInfo;
  guestEmail?: string;
  guestPhone?: string;
};
