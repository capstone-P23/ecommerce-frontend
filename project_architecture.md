# AI 맞춤 추천 이커머스 플랫폼 — 프론트엔드 설계서

> Next.js 14+ App Router 기반 B2B2C 멀티 테넌시 플랫폼
> 역할: 관리자(Admin) / 판매자(Seller) / 소비자(Consumer)

## 1. 기술 스택

| 분류            | 기술                         | 용도                      |
| --------------- | ---------------------------- | ------------------------- |
| 프레임워크      | Next.js 14+ (App Router)     | 라우팅, SSR/SSG, 미들웨어 |
| 언어            | TypeScript                   | 전체                      |
| 스타일링        | Tailwind CSS + Shadcn UI     | UI 컴포넌트               |
| 폼              | React Hook Form + Zod        | 폼 처리 및 유효성 검사    |
| 서버 상태       | TanStack Query (React Query) | API 데이터 패칭, 캐싱     |
| 클라이언트 상태 | Zustand                      | 장바구니, AI 채팅 세션 등 |
| API 모킹        | MSW (Mock Service Worker)    | 백엔드 미완성 구간 대응   |

## 2. 역할별 도메인 구조

이 프로젝트는 **세 개의 독립된 역할 도메인**으로 구성됩니다.

```text
admin.platform.com    →  (admin) Route Group
seller.platform.com   →  (seller) Route Group
{store}.platform.com  →  (consumer)/[storeDomain] 동적 라우팅
```

## 3. 디렉토리 구조

```text
app/
├── (auth)/
│   ├── login/page.tsx                        # [MEM-001] 로그인
│   └── signup/page.tsx                       # [MEM-001] 회원가입
│
├── (admin)/                                  # 관리자 영역
│   ├── layout.tsx                            # L-Type 레이아웃 (Sidebar + Main)
│   ├── dashboard/page.tsx                    # [ADM-STA-001,002] 통계 대시보드
│   ├── sellers/
│   │   ├── page.tsx                          # [ADM-SEL-001] 판매자 리스트
│   │   └── [id]/page.tsx                     # [ADM-SEL-002] 판매자 승인/등급 관리
│   ├── policy/page.tsx                       # [ADM-SET-001,002] 정산 정책 설정
│   └── contents/page.tsx                     # [ADM-CNT-001,002] 배너·카테고리·보안 로그
│
├── (seller)/                                 # 판매자 영역
│   ├── layout.tsx                            # L-Type 레이아웃 (Sidebar + Main)
│   ├── dashboard/page.tsx                    # [SEL-STA-001] 통계 대시보드
│   ├── members/page.tsx                      # [SEL-MEM-001] 회원 관리
│   ├── products/
│   │   ├── page.tsx                          # [SEL-PRD-001] 상품 리스트 및 추가
│   │   └── [productId]/options/page.tsx      # [SEL-PRD-002] 상품 옵션 관리
│   ├── orders/
│   │   ├── page.tsx                          # [SEL-ORD-001,003] 주문 관리
│   │   └── [orderId]/page.tsx                # [SEL-ORD-002] 주문 상세 및 송장 입력
│   ├── stock/
│   │   ├── page.tsx                          # [SEL-STK-001] 재고 현황
│   │   └── order/page.tsx                    # [SEL-STK-002] 발주서 작성
│   ├── settlement/page.tsx                   # [SEL-SET-001,002] 정산 관리
│   └── cs/page.tsx                           # [SEL-CS-001] 고객 문의 관리
│
└── (consumer)/                               # 소비자 영역
    └── [storeDomain]/
        ├── layout.tsx                        # Top-Down 레이아웃 + FloatingAIChat
        ├── page.tsx                          # [PRD-002,003] 홈 (AI 추천 피드, 카테고리)
        ├── products/
        │   ├── page.tsx                      # [PRD-001] 상품 검색
        │   └── [productId]/page.tsx          # [PRD-004] 상품 상세 (리뷰, Q&A 포함)
        ├── cart/page.tsx                     # [ORD-001] 장바구니
        ├── checkout/page.tsx                 # [ORD-002, PAY-001,002] 주문/결제
        └── mypage/
            └── orders/page.tsx              # [MEM-003, ORD-004] 주문·배송 조회 및 취소/교환
```

## 4. 미들웨어 (middleware.ts) 처리 전략

```ts
// 접속 호스트네임 기준으로 Route Group Rewrite
// admin.platform.com  → /admin/*
// seller.platform.com → /seller/*
// {store}.platform.com → /consumer/{store}/*  (DB 도메인 매핑 확인 후)

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');

  if (hostname?.startsWith('admin.'))
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));

  if (hostname?.startsWith('seller.'))
    return NextResponse.rewrite(new URL(`/seller${pathname}`, request.url));

  // 스토어 도메인 → DB 조회 후 동적 라우팅
  const storeDomain = hostname?.split('.')[0];
  return NextResponse.rewrite(
    new URL(`/consumer/${storeDomain}${pathname}`, request.url),
  );
}
```

## 5. 컴포넌트 설계

### 5-1. 공통 UI (`/components/ui`)

Shadcn 기반 Headless 컴포넌트. 역할 무관하게 공통 사용.

| 컴포넌트                            | 설명                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| Button, Input, Select, Modal, Badge | 기본 UI 원자                                               |
| DataTable                           | 페이지네이션·정렬·필터 지원. Admin/Seller 리스트 공통 사용 |
| Toast / AlertDialog                 | 서버 액션 응답 피드백                                      |

### 5-2. 레이아웃 (`/components/layout`)

| 컴포넌트       | 대상     | 설명                                                   |
| -------------- | -------- | ------------------------------------------------------ |
| AdminSidebar   | Admin    | 관리자 좌측 메뉴                                       |
| SellerSidebar  | Seller   | 판매자 좌측 메뉴                                       |
| TopNavigation  | Consumer | 상단 GNB (검색, 장바구니, 로그인)                      |
| FloatingAIChat | Consumer | [AI-001] 모든 소비자 페이지 우측 하단 고정 AI 에이전트 |

### 5-3. 도메인 기능 컴포넌트 (`/components/features`)

**Admin**

- `SellerApprovalList` — 승인/반려 서버 액션 연동
- `SystemLogViewer` — 실시간 보안 로그 출력
- `PolicyForm` — 정산 정책 설정 폼

**Seller**

- `ProductEditorForm` — 이미지 업로드 + 대용량 폼 처리
- `OptionManager` — 동적 옵션 추가/삭제
- `OrderKanbanBoard` — 주문 상태별 칸반
- `StockTable` — 재고 현황 및 발주 트리거

**Consumer**

- `ProductCard` — 상품 카드 (좋아요·찜 포함)
- `ProductGallery` — 이미지 슬라이더
- `CheckoutForm` — 결제 및 배송지 입력 컨테이너
- `ReviewSection` — 별점·텍스트·이미지 리뷰
- `QnASection` — 상품 Q&A 목록 및 작성

## 6. 렌더링 전략

| 페이지                                  | 렌더링 방식            | 이유                                  |
| --------------------------------------- | ---------------------- | ------------------------------------- |
| Admin/Seller 대시보드                   | RSC (Server Component) | DB 직접 조회 + 캐싱, 민감 데이터      |
| 소비자 상품 상세                        | RSC + generateMetadata | SEO 최적화                            |
| 소비자 홈 AI 추천 피드                  | RSC + Client Hydration | 초기 렌더는 서버, 개인화는 클라이언트 |
| 폼 류 (ProductEditorForm, CheckoutForm) | Client Component       | 상태·인터랙션 의존                    |
| FloatingAIChat                          | Client Component       | 실시간 인터랙션                       |
| 장바구니, 옵션 선택                     | Client Component       | Zustand 상태 연동                     |

## 7. 상태 관리 전략

### TanStack Query — 서버 상태

```ts
// queryKey 팩토리 패턴 권장
export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilter) =>
    [...productKeys.all, 'list', filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  recommended: (userId: string) =>
    [...productKeys.all, 'recommended', userId] as const,
};
```

### Zustand — 클라이언트 상태

```ts
// 장바구니
useCartStore; // items[], addItem, removeItem, clear

// AI 채팅 세션
useAIChatStore; // messages[], sessionId, sendMessage, reset

// 상품 비교
useCompareStore; // compareList[], addToCompare, removeFromCompare (최대 3개)
```

## 8. MSW 모킹 전략

백엔드 API 개발과 프론트 개발을 **병렬 진행**하기 위해 MSW 사용.

### 디렉토리 구조

```text
mocks/
├── browser.ts          # 브라우저 환경 ServiceWorker 설정
├── server.ts           # 테스트(Vitest) 환경 설정
├── handlers/
│   ├── index.ts        # 전체 핸들러 export
│   ├── auth.ts         # 로그인, 회원가입
│   ├── products.ts     # 상품 목록·상세·추천·비교
│   ├── orders.ts       # 장바구니·주문·결제·취소·교환
│   ├── members.ts      # 주문 내역·찜·최근 본 상품
│   ├── reviews.ts      # 리뷰 작성·조회
│   ├── qna.ts          # Q&A
│   ├── ai.ts           # AI 대화형 추천
│   ├── admin.ts        # 관리자 API 전체
│   └── seller.ts       # 판매자 API 전체
└── fixtures/
    ├── products.ts     # 상품 목 데이터
    ├── orders.ts
    └── users.ts
```

### 핸들러 예시

```ts
// mocks/handlers/products.ts
import { http, HttpResponse } from 'msw';
import { mockProducts } from '../fixtures/products';

export const productHandlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') ?? '';
    const filtered = mockProducts.filter((p) => p.name.includes(keyword));
    return HttpResponse.json({ data: filtered });
  }),

  http.get('/api/products/recommend', () => {
    return HttpResponse.json({ data: mockProducts.slice(0, 5) });
  }),

  http.get('/api/products/compare', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids')?.split(',') ?? [];
    const result = mockProducts.filter((p) => ids.includes(String(p.id)));
    return HttpResponse.json({ data: result });
  }),
];
```

### 환경 분기

```ts
// app/layout.tsx (또는 app/providers.tsx)
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

## 9. API 엔드포인트 전체 정리

### 인증 (Auth)

| Method | Endpoint                    | 기능        | no      |
| ------ | --------------------------- | ----------- | ------- |
| POST   | `/api/members/login`        | 로그인      | MEM-001 |
| POST   | `/api/members/signup`       | 회원가입    | MEM-001 |
| POST   | `/api/members/social-login` | 소셜 로그인 | MEM-002 |

### 소비자 — 상품

| Method | Endpoint                          | 기능            | no      |
| ------ | --------------------------------- | --------------- | ------- |
| GET    | `/api/products/search?keyword=`   | 상품 검색       | PRD-001 |
| GET    | `/api/products/recommend?userId=` | AI 맞춤 추천    | PRD-002 |
| GET    | `/api/products/category/{id}`     | 카테고리별 탐색 | PRD-003 |
| GET    | `/api/products/{productId}`       | 상품 상세       | PRD-004 |
| GET    | `/api/products/compare?ids=1,2,3` | 상품 비교       | PRD-004 |

### 소비자 — 주문/결제

| Method | Endpoint                      | 기능                | no      |
| ------ | ----------------------------- | ------------------- | ------- |
| GET    | `/api/cart`                   | 장바구니 조회       | ORD-001 |
| POST   | `/api/cart`                   | 장바구니 담기       | ORD-001 |
| DELETE | `/api/cart/{itemId}`          | 장바구니 삭제       | ORD-001 |
| POST   | `/api/orders`                 | 주문 생성           | ORD-002 |
| POST   | `/api/orders/payment`         | 결제 처리           | PAY-001 |
| POST   | `/api/orders/discount`        | 쿠폰·포인트 적용    | PAY-002 |
| POST   | `/api/orders/{orderId}/claim` | 취소·반품·교환 신청 | ORD-004 |

### 소비자 — 마이페이지

| Method | Endpoint                         | 기능              | no      |
| ------ | -------------------------------- | ----------------- | ------- |
| GET    | `/api/orders?userId=`            | 주문·배송 조회    | MEM-003 |
| GET    | `/api/users/benefits`            | 쿠폰·포인트 조회  | MEM-004 |
| POST   | `/api/products/{productId}/like` | 좋아요            | INT-001 |
| DELETE | `/api/products/{productId}/like` | 좋아요 취소       | INT-001 |
| GET    | `/api/wishlist`                  | 찜 목록 조회      | INT-002 |
| POST   | `/api/wishlist`                  | 찜 추가           | INT-002 |
| DELETE | `/api/wishlist/{productId}`      | 찜 삭제           | INT-002 |
| GET    | `/api/users/recently-viewed`     | 최근 본 상품      | INT-003 |
| POST   | `/api/users/recently-viewed`     | 최근 본 상품 기록 | INT-003 |

### 소비자 — 리뷰 / Q&A / AI

| Method | Endpoint                        | 기능           | no      |
| ------ | ------------------------------- | -------------- | ------- |
| POST   | `/api/reviews`                  | 리뷰 작성      | REV-001 |
| GET    | `/api/products/{productId}/qna` | Q&A 목록 조회  | QNA-001 |
| POST   | `/api/products/{productId}/qna` | Q&A 작성       | QNA-001 |
| POST   | `/api/ai/chat`                  | AI 대화형 추천 | AI-001  |
| GET    | `/api/ai/chat/{sessionId}`      | 채팅 세션 조회 | AI-001  |

### 판매자 (Seller)

| Method | Endpoint                            | 기능           | no          |
| ------ | ----------------------------------- | -------------- | ----------- |
| GET    | `/api/seller/stats`                 | 판매 통계      | SEL-STA-001 |
| GET    | `/api/seller/members`               | 회원 관리      | SEL-MEM-001 |
| GET    | `/api/seller/products`              | 상품 목록      | SEL-PRD-001 |
| POST   | `/api/seller/products`              | 상품 등록      | SEL-PRD-001 |
| GET    | `/api/seller/products/{id}/options` | 옵션 조회      | SEL-PRD-002 |
| POST   | `/api/seller/products/{id}/options` | 옵션 추가      | SEL-PRD-002 |
| GET    | `/api/seller/orders`                | 주문 관리      | SEL-ORD-001 |
| POST   | `/api/seller/orders/{id}/invoice`   | 송장 입력      | SEL-ORD-002 |
| GET    | `/api/seller/stock`                 | 재고 현황      | SEL-STK-001 |
| POST   | `/api/seller/stock/order`           | 발주 등록      | SEL-STK-002 |
| GET    | `/api/seller/settlement`            | 정산 조회      | SEL-SET-001 |
| GET    | `/api/seller/cs`                    | 고객 문의 조회 | SEL-CS-001  |

### 관리자 (Admin)

| Method | Endpoint                          | 기능               | no          |
| ------ | --------------------------------- | ------------------ | ----------- |
| GET    | `/api/admin/stats`                | 전체 통계          | ADM-STA-001 |
| GET    | `/api/admin/sellers`              | 판매자 리스트      | ADM-SEL-001 |
| PATCH  | `/api/admin/sellers/{id}/approve` | 판매자 승인/반려   | ADM-SEL-002 |
| GET    | `/api/admin/policy`               | 정산 정책 조회     | ADM-SET-001 |
| PATCH  | `/api/admin/policy`               | 정산 정책 수정     | ADM-SET-002 |
| GET    | `/api/admin/contents`             | 배너·카테고리 조회 | ADM-CNT-001 |
| PATCH  | `/api/admin/contents`             | 배너·카테고리 수정 | ADM-CNT-002 |
| GET    | `/api/admin/logs`                 | 보안 로그 조회     | ADM-CNT-002 |

## 10. 요구사항 no 전체 매핑

| no          | 역할   | 기능명                 | 페이지 경로                   |
| ----------- | ------ | ---------------------- | ----------------------------- |
| MEM-001     | 공통   | 기본 회원가입/로그인   | `/login`, `/signup`           |
| MEM-002     | 소비자 | 소셜 로그인            | `/login`                      |
| MEM-003     | 소비자 | 주문 내역 조회         | `/mypage/orders`              |
| MEM-004     | 소비자 | 쿠폰/포인트 관리       | `/mypage/orders`              |
| PRD-001     | 소비자 | 상품 검색              | `/products`                   |
| PRD-002     | 소비자 | AI 개인화 추천         | `/` (홈)                      |
| PRD-003     | 소비자 | 상품 카테고리 탐색     | `/` (홈)                      |
| PRD-004     | 소비자 | 상품 상세              | `/products/[id]`              |
| ORD-001     | 소비자 | 장바구니 관리          | `/cart`                       |
| ORD-002     | 소비자 | 주문 생성              | `/checkout`                   |
| ORD-003     | 소비자 | 배송 추적              | `/mypage/orders`              |
| ORD-004     | 소비자 | 주문 취소/반품/교환    | `/mypage/orders`              |
| PAY-001     | 소비자 | 결제                   | `/checkout`                   |
| PAY-002     | 소비자 | 쿠폰 적용/포인트 사용  | `/checkout`                   |
| REV-001     | 소비자 | 리뷰 작성              | `/products/[id]`              |
| INT-001     | 소비자 | 좋아요                 | `/products`, `/products/[id]` |
| INT-002     | 소비자 | 찜 (위시리스트)        | `/products/[id]`, `/mypage`   |
| INT-003     | 소비자 | 최근 본 상품           | `/`, `/mypage`                |
| AI-001      | 소비자 | 대화형 추천 (AI Agent) | 전 페이지 FloatingAIChat      |
| QNA-001     | 소비자 | Q&A                    | `/products/[id]`              |
| SEL-STA-001 | 판매자 | 통계 대시보드          | `/dashboard`                  |
| SEL-MEM-001 | 판매자 | 회원 관리              | `/members`                    |
| SEL-PRD-001 | 판매자 | 상품 관리 (목록/추가)  | `/products`                   |
| SEL-PRD-002 | 판매자 | 상품 옵션 관리         | `/products/[id]/options`      |
| SEL-ORD-001 | 판매자 | 주문 관리              | `/orders`                     |
| SEL-ORD-002 | 판매자 | 주문 확인 (송장 입력)  | `/orders/[id]`                |
| SEL-ORD-003 | 판매자 | 주문 상태 변경         | `/orders`                     |
| SEL-STK-001 | 판매자 | 재고 현황              | `/stock`                      |
| SEL-STK-002 | 판매자 | 발주서                 | `/stock/order`                |
| SEL-SET-001 | 판매자 | 정산 조회              | `/settlement`                 |
| SEL-SET-002 | 판매자 | 정산 기간 설정         | `/settlement`                 |
| SEL-CS-001  | 판매자 | 고객 문의 관리         | `/cs`                         |
| ADM-STA-001 | 관리자 | 통계 대시보드          | `/dashboard`                  |
| ADM-STA-002 | 관리자 | 사용자 분석            | `/dashboard`                  |
| ADM-SEL-001 | 관리자 | 판매자 리스트          | `/sellers`                    |
| ADM-SEL-002 | 관리자 | 판매자 승인/등급 관리  | `/sellers/[id]`               |
| ADM-SET-001 | 관리자 | 정산 정책 조회         | `/policy`                     |
| ADM-SET-002 | 관리자 | 정산 정책 수정         | `/policy`                     |
| ADM-CNT-001 | 관리자 | 배너·카테고리 관리     | `/contents`                   |
| ADM-CNT-002 | 관리자 | 보안 로그 모니터링     | `/contents`                   |
