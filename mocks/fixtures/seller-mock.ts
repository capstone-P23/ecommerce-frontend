// Seller mock-only 픽스처 (phase 6b).
// 백엔드 endpoint 가 추가되면 이 파일 통째 삭제 + handlers/queries 정렬.

import type {
  SellerInquiry,
  SellerMember,
  SellerOrderDetail,
  SellerOrderListItem,
  SellerProduct,
  SellerProductOption,
  SellerSettlement,
  SellerStats,
} from '@/types/api';

const KRW = 'KRW';
const today = new Date();
const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const sellerMockState = {
  stats: {
    revenueToday: 1_230_000,
    ordersToday: 24,
    stockAlerts: 3,
    pendingShipments: 12,
    currency: KRW,
  } satisfies SellerStats,

  members: [
    {
      memberId: 1001,
      name: '김소비자',
      email: 'consumer@demo.com',
      joinedAt: isoDaysAgo(120),
      totalOrders: 17,
      totalSpent: 489_000,
      currency: KRW,
    },
    {
      memberId: 1002,
      name: '이고객',
      email: 'guest@example.com',
      joinedAt: isoDaysAgo(45),
      totalOrders: 4,
      totalSpent: 92_500,
      currency: KRW,
    },
    {
      memberId: 1003,
      name: '박단골',
      email: 'loyal@example.com',
      joinedAt: isoDaysAgo(365),
      totalOrders: 73,
      totalSpent: 2_310_000,
      currency: KRW,
    },
  ] as SellerMember[],

  products: [
    { id: 1, name: '오가닉 망고', categoryName: '식품', price: 12_000, currency: KRW, totalStock: 42, status: 'ACTIVE' },
    { id: 2, name: '아보카도 6개', categoryName: '식품', price: 18_900, currency: KRW, totalStock: 18, status: 'ACTIVE' },
    { id: 3, name: '에티오피아 예가체프 200g', categoryName: '음료', price: 16_500, currency: KRW, totalStock: 7, status: 'ACTIVE' },
    { id: 4, name: '핸드드립 세트', categoryName: '주방용품', price: 89_000, currency: KRW, totalStock: 0, status: 'SOLD_OUT' },
  ] as SellerProduct[],

  options: [
    { optionId: 1, productId: 1, name: '크기', value: 'M', stock: 24, priceDelta: 0 },
    { optionId: 2, productId: 1, name: '크기', value: 'L', stock: 18, priceDelta: 2_000 },
    { optionId: 3, productId: 3, name: '분쇄도', value: '원두', stock: 7, priceDelta: 0 },
  ] as SellerProductOption[],

  orders: [
    {
      orderNumber: 'ORD-2026-S001',
      customerName: '김소비자',
      itemCount: 2,
      totalAmount: 30_900,
      currency: KRW,
      status: 'PAID',
      createdAt: isoDaysAgo(0),
    },
    {
      orderNumber: 'ORD-2026-S002',
      customerName: '박단골',
      itemCount: 1,
      totalAmount: 89_000,
      currency: KRW,
      status: 'PREPARING',
      createdAt: isoDaysAgo(1),
    },
    {
      orderNumber: 'ORD-2026-S003',
      customerName: '이고객',
      itemCount: 3,
      totalAmount: 47_400,
      currency: KRW,
      status: 'SHIPPED',
      trackingNumber: 'CJ123456789',
      createdAt: isoDaysAgo(3),
    },
  ] as SellerOrderListItem[],

  orderDetails: new Map<string, SellerOrderDetail>([
    [
      'ORD-2026-S001',
      {
        orderNumber: 'ORD-2026-S001',
        customerName: '김소비자',
        itemCount: 2,
        totalAmount: 30_900,
        currency: KRW,
        status: 'PAID',
        createdAt: isoDaysAgo(0),
        items: [
          { productId: 1, productName: '오가닉 망고', quantity: 1, priceAmount: 12_000, subtotal: 12_000 },
          { productId: 2, productName: '아보카도 6개', quantity: 1, priceAmount: 18_900, subtotal: 18_900 },
        ],
        receiverName: '김소비자',
        receiverPhone: '010-1111-2222',
        address: '서울 마포구 와우산로 94',
      },
    ],
    [
      'ORD-2026-S002',
      {
        orderNumber: 'ORD-2026-S002',
        customerName: '박단골',
        itemCount: 1,
        totalAmount: 89_000,
        currency: KRW,
        status: 'PREPARING',
        createdAt: isoDaysAgo(1),
        items: [
          { productId: 4, productName: '핸드드립 세트', quantity: 1, priceAmount: 89_000, subtotal: 89_000 },
        ],
        receiverName: '박단골',
        receiverPhone: '010-3333-4444',
        address: '경기 성남시 분당구 판교역로 235',
      },
    ],
    [
      'ORD-2026-S003',
      {
        orderNumber: 'ORD-2026-S003',
        customerName: '이고객',
        itemCount: 3,
        totalAmount: 47_400,
        currency: KRW,
        status: 'SHIPPED',
        trackingNumber: 'CJ123456789',
        createdAt: isoDaysAgo(3),
        items: [
          { productId: 1, productName: '오가닉 망고', quantity: 2, priceAmount: 12_000, subtotal: 24_000 },
          { productId: 3, productName: '에티오피아 예가체프 200g', quantity: 1, priceAmount: 16_500, subtotal: 16_500 },
          { productId: 2, productName: '아보카도 6개', quantity: 1, priceAmount: 18_900, subtotal: 6_900 },
        ],
        receiverName: '이고객',
        receiverPhone: '010-5555-6666',
        address: '부산 해운대구 우동 1417',
      },
    ],
  ]),

  settlements: [
    { period: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`, grossSales: 12_430_000, fee: 622_000, payout: 11_808_000, currency: KRW, status: 'PENDING' },
    { period: `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`, grossSales: 8_430_000, fee: 421_500, payout: 8_008_500, currency: KRW, status: 'COMPLETED', settledAt: isoDaysAgo(2) },
    { period: `${today.getFullYear()}-${String(today.getMonth() - 1).padStart(2, '0')}`, grossSales: 7_120_000, fee: 356_000, payout: 6_764_000, currency: KRW, status: 'COMPLETED', settledAt: isoDaysAgo(33) },
  ] as SellerSettlement[],

  inquiries: [
    { inquiryId: 1, subject: '배송 지연 문의', customerName: '김소비자', status: 'OPEN', createdAt: isoDaysAgo(0), body: '주문 후 3일째인데 배송이 시작되지 않았습니다.' },
    { inquiryId: 2, subject: '환불 진행 상황', customerName: '이고객', status: 'IN_PROGRESS', createdAt: isoDaysAgo(2), body: '반품 신청한 상품의 환불 진행 상황이 궁금합니다.', answer: '확인 후 영업일 기준 3일 내 환불 예정입니다.' },
    { inquiryId: 3, subject: '상품 옵션 문의', customerName: '박단골', status: 'CLOSED', createdAt: isoDaysAgo(7), body: '핸드드립 세트에 드리퍼가 포함되나요?', answer: '하리오 드리퍼 + 서버 + 케틀 포함된 풀세트입니다.' },
  ] as SellerInquiry[],
};

export function addInquiryAnswer(inquiryId: number, answer: string) {
  const inquiry = sellerMockState.inquiries.find((i) => i.inquiryId === inquiryId);
  if (!inquiry) return;
  inquiry.answer = answer;
  inquiry.status = 'CLOSED';
}

export function setOrderTracking(orderNumber: string, trackingNumber: string) {
  const list = sellerMockState.orders.find((o) => o.orderNumber === orderNumber);
  if (list) {
    list.trackingNumber = trackingNumber;
    list.status = 'SHIPPED';
  }
  const detail = sellerMockState.orderDetails.get(orderNumber);
  if (detail) {
    detail.trackingNumber = trackingNumber;
    detail.status = 'SHIPPED';
  }
}

export function addProductOption(option: Omit<SellerProductOption, 'optionId'>) {
  const nextId = sellerMockState.options.reduce((max, o) => Math.max(max, o.optionId), 0) + 1;
  sellerMockState.options.push({ ...option, optionId: nextId });
}
