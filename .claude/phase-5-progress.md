# 프로젝트 셋업 기록 — Phase 5 진행 + 후속 로드맵

> 2026-05-11 ~ 2026-05-20 의 Claude Code 세션 기록.
> Phase 5 (Consumer 핵심 동선) 의 하위 단계별 진행 + 남은 phase 의 작업 가이드.

이전 기록: [`phase-0-to-4-setup.md`](./phase-0-to-4-setup.md)

---

## 🧭 횡단 결정 (Phase 5 이후 추가/확정)

### 1. 백엔드 단일 출처 원칙 (확정·적용 중)
- `api/api-docs.json` (OpenAPI 3.1) 이 single source of truth
- 새 endpoint 작업 시 항상 OpenAPI 스키마 먼저 확인
- mock 핸들러 / queryKey / 타입은 백엔드 응답 스키마 그대로 복제
- **응답 envelope `{ data: ... }` 제거** — 백엔드는 객체/배열 직접 반환, mock 도 동일
- `project_architecture.md` 9장은 derived doc 으로 강등 (참조용)

### 2. mocks/handlers 정렬 전략: as-we-go
- Phase 단위로 사용처가 생길 때 해당 도메인 mock 을 백엔드 스키마로 정렬
- 미정렬 mock 은 dead code 가 아니라 "다음 phase 에서 정렬 예정" 표시
- 현재 정렬 완료: `auth`, `members(me)`, `products`, `categories`, `cart`
- 정렬 미완료: `orders`, `members(나머지)`, `reviews`, `qna`, `ai`, `seller`, `admin`
- 기존 `mockProducts` 는 `mockProductSummaries` 로 명칭 변경 + deprecated alias 유지

### 3. Toss frontend rules 적용 (확정)
출처: `.claude/toss-frontend-rules.md`. 모든 신규 코드에 다음 원칙 적용:
- **Named constants** (매직 넘버 금지) — `DEFAULT_PRODUCT_PAGE_SIZE`, `MIN_QUANTITY`, `MAX_BADGE_DISPLAY`
- **Single Responsibility** — Card 는 표시만 / View 는 fetch / Page 는 라우팅
- **Consistent return** — query 는 `UseQueryResult<T>`, mutation 은 `UseMutationResult<T, Error, Args>`
- **Named conditions** — `isAvailable = status === 'ACTIVE' && inStock`
- **Composition over props drilling** — `hrefFor: (p) => string` 콜백으로 컨텍스트 격리
- **Separate sub-views** — `CartView` 가 `CartLoginPrompt` / `CartEmpty` / `CartSkeleton` / `CartError` 로 분기
- **Dedicated Interaction Component** — `AddToCartButton` 이 인증/mutation/toast 까지 캡슐화
- **URL = single source** — 검색/필터/페이지 모두 URL searchParams 로 통일

### 4. CodeRabbit AI 리뷰 (확정)
- `.coderabbit.yaml` — 한국어, profile chill, base_branches 에 `dev` 등록 (default branch 가 main 이라 명시 필요)
- `path_filters` include: `app/**`, `components/**`, `lib/**`, `mocks/**`, `proxy.ts`, `.github/**`, `.coderabbit.yaml`, `docker-compose*.yml`, `.env.example`, `docs/**`
- path_filters exclude: `components/ui/**` (shadcn 자동 생성), `public/mockServiceWorker.js`, `api/api-docs.json`

### 5. Docker 로컬 환경 (확정)
- `docker-compose.yml` — BE 가 빌드한 `kwondh1126/ecommerce-be:latest` + `mysql:8.0`
- secret 은 `.env` (gitignored) 보간 — `${VAR:?...}` 로 누락 사전 차단
- 단, `MYSQL_ROOT_PASSWORD` 는 컨테이너 내부 전용 dev secret → 기본값 줘야 BE 가 안 줘도 동작 (TODO)
- 가이드: `docs/docker-local-dev.md`

---

## ✅ Phase 5a — Product Discovery (PR #21)

**범위**: 읽기 전용 / 인증 불필요. 첫 진짜 데이터 연동.

### 신규
- `types/api.ts` — 백엔드 스키마 1:1 미러 (`PageResponse<T>`, `Category`, `ProductSummary`, `ProductDetail`, `Sku`, `SkuOption`, `ProductStatus`)
- `lib/format.ts` — `formatPrice` 통화 표시 유틸
- `lib/queries/products.ts` — `useProductList`, `useProductDetail` (`UseQueryResult<T>` 일관 반환)
- `lib/queries/categories.ts` — `useCategories` (staleTime 30분 — 카테고리 변동 적음)
- `mocks/handlers/products.ts` — `GET /api/products` (keyword/categoryId/page/size), `GET /api/products/{id}`
- `mocks/handlers/categories.ts` — `GET /api/categories`
- `mocks/fixtures/products.ts` — 백엔드 스키마 재작성 (picsum.photos 임시 이미지)
- `components/consumer/` — `product-status-badge`, `product-card`, `product-grid`, `category-filter`, `pagination`, `coming-soon-section`, `consumer-home-view`, `product-list-view`, `product-detail-view`

### 페이지 연결
- `app/consumer/[storeDomain]/page.tsx` → `ConsumerHomeView`
- `app/consumer/[storeDomain]/products/page.tsx` → `ProductListView`
- `app/consumer/[storeDomain]/products/[productId]/page.tsx` → `ProductDetailView` (+ `notFound()` 가드)
- `components/layout/top-navigation.tsx` — 검색 form `onSubmit` 활성화

### 백엔드 미구현 → placeholder 처리
- 상품 상세: 리뷰/Q&A → `<ComingSoonSection title="상품 리뷰 · Q&A" plannedPhase="백엔드 구현 후" />`
- 홈: AI 추천 자리 → 일반 상품 리스트로 대체

---

## 🔧 Refactor — 검색바 통합 (PR #25)

문제: 헤더(TopNavigation)와 `/products` 의 검색 form 이 중복.
해결: **헤더가 단일 검색 입력**. `useSearchParams` + `key={keyword} + defaultValue` 패턴으로 URL 바뀌면 input 자동 동기.
효과: `ProductListView` 약 30 라인 감소, 사용자 멘탈 모델 단순화 (네이버쇼핑/쿠팡 패턴).

---

## ✅ Phase 5b — Cart (PR #26)

**범위**: 인증 필요. 장바구니 전체 흐름.

### 신규
- `types/api.ts` 확장 — `Cart`, `CartItem`, `AddCartItemRequest`, `UpdateCartItemRequest`
- `mocks/fixtures/cart.ts` — **모듈 mutable 상태** + helper (`addCartItem` / `updateCartItemQuantity` / `removeCartItem` / `clearCart` / `snapshotCart`). dev 세션 동안만 유지
- `mocks/handlers/cart.ts` — 5 endpoint:
  - `GET    */api/cart`
  - `DELETE */api/cart` (전체 비우기)
  - `POST   */api/cart/items`
  - `PATCH  */api/cart/items/{itemId}`
  - `DELETE */api/cart/items/{itemId}`
- `lib/queries/cart.ts` — `useCart`, `useAddCartItem`, `useUpdateCartItemQuantity`, `useRemoveCartItem`, `useClearCart`
  - 인증: `useAuthStore` 에서 토큰 가져와 `apiFetch({ authToken })`
  - 캐시: mutation 성공 시 `queryClient.setQueryData` 로 서버 snapshot 직접 반영
- `components/consumer/` — `cart-item-row`, `cart-summary`, `cart-view`, `add-to-cart-button`, `cart-icon-with-badge`

### 연결
- `app/consumer/[storeDomain]/cart/page.tsx` → `CartView`
- `product-detail-view.tsx` — disabled 버튼 → `<AddToCartButton product={product} />`
- `top-navigation.tsx` — 단순 Link → `<CartIconWithBadge href={...} />`

### 인증 처리 패턴
- `useCart` 는 `accessToken` 없으면 `enabled: false` (fetch 자체 안 함)
- 헤더 배지: 비로그인 시 자동 비표시
- 상품 상세 "장바구니 담기" 비로그인 클릭 → toast + `/login` redirect
- 카트 페이지 비로그인 시 안내 카드 (전체 redirect 안 함 — UX 부드러움)

### SKU 처리
- mock 상품은 SKU 1개씩 → `firstAvailableSku = product.skus.find(s => s.inStock)`
- TODO: 옵션 다양한 상품의 SKU 선택 UI (백엔드가 실제로 줄 때)

### orders.ts 정리
- 구 cart 핸들러 3개 → `cart.ts` 로 이관 + 충돌 방지
- 주문 관련 핸들러는 Phase 5c 에서 정렬

---

## 🐛 트러블슈팅 노트 (Phase 5 추가)

### Vercel Hobby 일일 업로드 한도 5000
- 빈번한 PR 시 hit 가능 (`Too many requests - try again in 24 hours, code: "api-upload-free"`)
- 24h 후 자동 리셋 / 또는 Pro 업그레이드
- 코드 검증(lint/typecheck/build) 은 영향 없으니 머지는 가능

### shadcn Button 의 asChild 부재
- 이 프로젝트의 shadcn 은 `@base-ui/react` 기반 (구 Radix 아님)
- Button 에 `asChild` 없음 → `buttonVariants` 로 Link 에 스타일만 적용 (HTML `<a> in <button>` 무효 케이스도 동시 회피)
- Dialog / Sheet 등은 `render={<Element/>}` 패턴

### React 19 의 set-state-in-effect 룰
- useEffect 안 setState 호출 자제. URL hash 같은 1회성 초기화는 `useState(init함수)` 패턴

### dev 서버 stale (Phase 0~4 에서 다룸, 재발)
- 의존성 변경 후 `pkill -f "next dev" && rm -rf .next && npm run dev`

---

## 📋 PR 인덱스 (Phase 5)

| # | 제목 | 베이스 |
|---|---|---|
| 17 | ci: coderabbit 설정 추가 | dev |
| 19 | chore: docker compose 로컬 환경 추가 | dev |
| 21 | feat: phase 5a 소비자 상품 발견 | dev |
| 25 | refactor: 검색바 단일 소스 통합 | dev |
| 26 | feat: phase 5b 장바구니 동선 | dev |

---

## 🗺️ 남은 Phase — 작업 가이드

각 phase 진입 시 **반드시 먼저 확인**:
1. `api/api-docs.json` 에서 해당 도메인 endpoint 와 스키마
2. 백엔드가 미구현인 기능은 `<ComingSoonSection />` 또는 disabled UI 로 자리표시
3. mock 핸들러를 백엔드 스키마와 정렬 (구 stub 이 있다면 재작성)

### 🔜 Phase 5c — Order / Checkout

**백엔드 endpoint**:
- `POST /api/orders/me` — 주문 생성 (`CreateOrderRequest = { items, delivery, guestEmail?, guestPhone? }`)
- `GET /api/orders/me` — 내 주문 목록 (`PageResponse<OrderResponse>`)
- `GET /api/orders/me/{orderId}` — 주문 상세 (`OrderDetailResponse`)
- `POST /api/orders/me/{orderId}/cancel` — 취소

**작업**:
- `mocks/handlers/orders.ts` 전면 재작성 (현재 구 stub)
- `lib/queries/orders.ts` — `useMyOrders`, `useOrderDetail`, `useCreateOrder`, `useCancelOrder`
- `app/consumer/[storeDomain]/checkout/page.tsx` — 체크아웃 폼 (배송정보 + 결제 — 결제는 PG 미연동이라 mock)
- `app/consumer/[storeDomain]/mypage/orders/page.tsx` — 주문 목록 + 상세 + 취소
- 장바구니 페이지의 "주문하기" disabled → 활성화 (cart → checkout 이동)

**미구현** (백엔드 X): 쿠폰/포인트 (`PAY-002`), 배송 추적 상세 (`ORD-003`), 반품/교환 (`ORD-004` 의 cancel 외 액션)

**백엔드 팀 공유 필요 사항**:
- `CreateOrderRequest.delivery` (DeliveryInfoRequest) 스키마 디테일
- `OrderResponse.status` 가 `PENDING`/`CANCELLED` 두 개뿐 — 배송 추적 단계는 추후 추가?
- 결제 PG 연동 시점 / 어떤 PG 사용

### 🔜 Phase 6 — Seller

**백엔드 endpoint** (api-docs.json):
- `GET/POST /api/seller/purchase-orders` (발주)
- `GET /api/seller/stocks/receive-history`
- `PATCH /api/seller/stocks/receive[/{id}[/cancel]]` (입고)

**없음**: 판매자 상품 관리, 주문 관리, 정산, CS, 회원 — 모두 admin 영역으로 이전된 듯
→ **백엔드 팀과 역할 분담 재확인 필요**. 설계서의 seller 영역이 admin 으로 통합됐는지

**작업** (역할 확정 후):
- `mocks/handlers/seller.ts` 전면 재작성
- `lib/queries/seller.ts`
- `components/seller/` — purchase-order-form, receive-history-table, receive-action-buttons
- `app/seller/{purchase-orders,stock/order,stock/receive-history}/page.tsx`
- 기존 seller 사이드바 메뉴 정리 (백엔드 실제 영역에 맞춰)

### 🔜 Phase 7 — Admin

**백엔드 endpoint**:
- 상품: `/api/admin/products`, `/api/admin/products/{id}` (PATCH/DELETE), `/skus` 관리, `/stock/{increase,decrease}`
- 카테고리: `POST/PATCH /api/admin/categories[/{id}]`
- 회원: `GET /api/admin/members`, `/api/admin/members/{id}` (GET/DELETE), `/blacklist` (POST/DELETE)
- 알림: `/api/admin/notifications[/{id}/read]`, `read-all`, `unread-count`
- 재고 이력: `GET /api/admin/products/{id}/stock-histories`

**작업**:
- mock + queryKey + UI 컴포넌트 + 페이지
- 기존 admin 사이드바 메뉴 정리 (실제 endpoint 기준)

### 🔜 Phase 8 — AI Chat (보류)

백엔드 미구현. AI agent (`AI-001`) 는 backend 추가 시 진행.
현재 `FloatingAIChat` 은 Sheet 껍데기만 있음.

### 🔜 Phase 9 — Quality

- 에러 바운더리 (`error.tsx` per route)
- `loading.tsx` / `not-found.tsx` 표준화
- 접근성 audit (axe-core / pa11y)
- SEO 메타데이터 (페이지별 generateMetadata)
- 이미지 최적화 (`<img>` → Next `<Image>`, `remotePatterns` 등록)
- 단위 테스트 / E2E (Vitest + Playwright — 도입 시점 결정 필요)
- 로그아웃 시 queryClient.clear() 처리

---

## 🔗 운영 메모 (Phase 5 추가)

### Vercel 자동 배포 정책
- preview: PR + dev push
- production: main push
- production 환경 변수에 `NEXT_PUBLIC_API_BASE_URL` 미설정 시 `localhost:8080` 폴백 → 배포본에서 OAuth 안 됨 (Phase 4 노트 참조)

### 백엔드 팀에 누적된 요청 (PR description 들에 기록)
**즉시는 필요 X, 다음 phase 진입 시 정리하면 좋음**:
- 상품 정렬 옵션 (`?sort=` 허용 필드)
- 이미지 호스팅 도메인 (Next Image `remotePatterns` 등록 위해)
- storeDomain 멀티테넌시 정책 (현재 URL prefix 만, BE 무시)
- 검색 페이지 크기 최댓값 (`size=` 제한)
- 장바구니: 같은 productId 두 번 담을 때 quantity 누적 정책
- 장바구니: 재고 초과 quantity 요청 시 status / 메시지
- 주문: `OrderResponse.status` enum 확장 (배송 추적 단계)
- 결제 PG 연동 일정
