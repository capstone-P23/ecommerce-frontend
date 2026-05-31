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
// Q&A
// ─────────────────────────────────────────────────────────────

export type QuestionStatus = 'PENDING' | 'ANSWERED';

export type QuestionResponse = {
  id: number;
  productId: number;
  productName: string;
  memberName: string;
  content: string;
  secret: boolean;
  status: QuestionStatus;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
};

export type QuestionCreateRequest = {
  content: string;
  secret?: boolean;
};

export type AnswerRequest = {
  content: string;
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

// ─────────────────────────────────────────────────────────────
// Seller — Purchase Order (발주)
// ─────────────────────────────────────────────────────────────

export type PurchaseOrderStatus = 'REQUESTED' | 'RECEIVED' | 'CANCELLED';

/** GET /api/seller/purchase-orders 목록 원소 */
export type PurchaseOrderListItem = {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  skuId: number;
  quantity: number;
  supplierName: string;
  expectedAt: string; // YYYY-MM-DD
  status: PurchaseOrderStatus;
  createdAt: string;
};

/** POST /api/seller/purchase-orders 응답 (id + number 만) */
export type PurchaseOrderRef = {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
};

export type CreatePurchaseOrderRequest = {
  skuId: number;
  quantity: number;
  supplierName: string;
  supplierContact?: string;
  expectedAt: string; // YYYY-MM-DD
};

// ─────────────────────────────────────────────────────────────
// Seller — Stock (입고)
// ─────────────────────────────────────────────────────────────

export type ReceiveStockRequest = {
  purchaseOrderId: number;
  receivedQuantity?: number; // 미지정 시 PO quantity 그대로 (백엔드 규칙 가정)
};

export type ReceiveStockResponse = {
  purchaseOrderId: number;
  skuId: number;
  receivedQuantity: number;
  currentStock: number;
  status: PurchaseOrderStatus;
};

export type ReceiveAdjustRequest = {
  receivedQuantity?: number;
  reason: string;
};

export type ReceiveAdjustResponse = {
  receiveHistoryId: number;
  skuId: number;
  originalQuantity: number;
  adjustedQuantity: number;
  currentStock: number;
  reason: string;
};

export type ReceiveCancelResponse = {
  receiveHistoryId: number;
  skuId: number;
  cancelledQuantity: number;
  currentStock: number;
  purchaseOrderStatus: PurchaseOrderStatus;
};

export type ReceiveHistory = {
  stockHistoryId: number;
  skuId: number;
  purchaseOrderId: number;
  receivedQuantity: number;
  stockAfter: number;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────────────────────

export type AiChatRequest = {
  sessionId: string;
  message: string;
};

export type AiChatRecommendation = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  reason: string;
};

export type AiChatResponse = {
  sessionId: string;
  answer: string;
  recommendations: AiChatRecommendation[];
  followUpQuestions: string[];
};

// ─────────────────────────────────────────────────────────────
// Seller — mock-only (백엔드 endpoint 미정, phase 6b)
// 백엔드가 정식 endpoint 를 추가하면 이 섹션을 정렬 후 mock 제거.
// ─────────────────────────────────────────────────────────────

export type SellerStats = {
  revenueToday: number;
  ordersToday: number;
  stockAlerts: number;
  pendingShipments: number;
  currency: string;
};

export type SellerMember = {
  memberId: number;
  name: string;
  email: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
};

export type SellerProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DISCONTINUED';

export type SellerProduct = {
  id: number;
  name: string;
  categoryName: string;
  price: number;
  currency: string;
  totalStock: number;
  status: SellerProductStatus;
};

export type SellerProductOption = {
  optionId: number;
  productId: number;
  name: string;
  value: string;
  stock: number;
  priceDelta: number;
};

export type SellerOrderStatus =
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type SellerOrderListItem = {
  orderNumber: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  currency: string;
  status: SellerOrderStatus;
  trackingNumber?: string;
  createdAt: string;
};

export type SellerOrderDetail = SellerOrderListItem & {
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    priceAmount: number;
    subtotal: number;
  }>;
  receiverName: string;
  receiverPhone: string;
  address: string;
};

export type SellerSettlement = {
  period: string; // YYYY-MM
  grossSales: number;
  fee: number;
  payout: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED';
  settledAt?: string;
};

export type SellerInquiry = {
  inquiryId: number;
  subject: string;
  customerName: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  body: string;
  answer?: string;
};

// ─────────────────────────────────────────────────────────────
// Admin — Product / SKU / Category (백엔드 정렬, api-docs.json)
// ─────────────────────────────────────────────────────────────

export type ProductCreateRequest = {
  name: string;
  price: number;
  currency: string;
  description: string;
  mainImageUrl: string;
  categoryId: number;
};

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export type SkuOptionRequest = {
  name: string;
  value: string;
};

export type AddSkuRequest = {
  options: SkuOptionRequest[];
  initialStock: number;
};

export type AdjustStockRequest = {
  quantity: number;
};

export type CategoryCreateRequest = {
  name: string;
  /** ^[a-zA-Z0-9-]+$ pattern (백엔드 제약) */
  slug: string;
};

export type CategoryUpdateRequest = Partial<CategoryCreateRequest>;

export type StockChangeType =
  | 'ORDER'
  | 'ORDER_CANCEL'
  | 'ADMIN_INCREASE'
  | 'ADMIN_DECREASE'
  | 'SKU_CREATED';

export type StockHistory = {
  id: number;
  productId: number;
  productName: string;
  skuId: number;
  skuCode: string;
  skuOptionsSnapshot: string;
  changeType: StockChangeType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  orderId?: number;
  occurredAt: string;
};

// ─────────────────────────────────────────────────────────────
// Admin — Member
// ─────────────────────────────────────────────────────────────

export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
export type MemberRole = 'USER' | 'ADMIN';

export type MemberAdmin = {
  id: number;
  email: string;
  name: string;
  picture?: string;
  status: MemberStatus;
  role: MemberRole;
  emailVerified: boolean;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────
// Admin — Notification
// ─────────────────────────────────────────────────────────────

export type NotificationType = 'SOLD_OUT';

export type Notification = {
  id: number;
  type: NotificationType;
  productId: number;
  productName: string;
  skuId: number;
  skuCode: string;
  skuOptionsSnapshot: string;
  isRead: boolean;
  occurredAt: string;
};

// ─────────────────────────────────────────────────────────────
// Admin — mock-only (백엔드 endpoint 미정, phase 7c)
// dashboard / sellers / policy / contents
// ─────────────────────────────────────────────────────────────

export type AdminDashboardStats = {
  grossSales: number;
  currency: string;
  totalOrders: number;
  totalMembers: number;
  activeSellers: number;
  unreadNotifications: number;
};

export type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SellerGrade = 'BRONZE' | 'SILVER' | 'GOLD';

export type SellerApplication = {
  id: number;
  brandName: string;
  representativeName: string;
  email: string;
  appliedAt: string;
  status: SellerApplicationStatus;
  grade: SellerGrade | null;
};

export type SettlementCycle = 'WEEKLY' | 'MONTHLY';

export type SettlementPolicy = {
  commissionRate: number; // 0.05 = 5%
  cycle: SettlementCycle;
  minimumPayout: number;
  currency: string;
};

export type AdminBanner = {
  bannerId: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  displayOrder: number;
};

export type SecurityLogType =
  | 'LOGIN_FAILURE'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_REQUEST';

export type SecurityLog = {
  logId: number;
  type: SecurityLogType;
  actorEmail?: string;
  ipAddress: string;
  message: string;
  occurredAt: string;
};
