# 프로젝트 셋업 기록 — Phase 6 ~ 9

> 2026-05-20 ~ 2026-05-22 의 Claude Code 세션 기록.
> Phase 6 (Seller) / Phase 7 (Admin) / Phase 8 (Skipped) / Phase 9 (Quality) 진행.

이전 기록: [`phase-5-progress.md`](./phase-5-progress.md) · [`phase-0-to-4-setup.md`](./phase-0-to-4-setup.md)

---

## 🧭 횡단 결정 (Phase 5 이후 추가)

### 1. mock-only 영역 핸들링 정착
백엔드 endpoint 가 미정인 화면은 다음 패턴 일관 적용:
- mock 핸들러 path 는 자연스러운 컨벤션 (예: `/api/seller/dashboard/stats`)으로 가칭. 백엔드 정렬 시 핸들러 삭제만 하면 자동 흐름 이동
- 화면 상단에 `<MockNotice />` / `<AdminMockNotice />` 띠 — "백엔드 endpoint 미정" 명시
- mock 파일은 `seller-mock.ts`, `admin-mock.ts` 등 `-mock` suffix 로 분리 (백엔드 정렬 시 일괄 제거 가능)
- queryKey 도 별도: `sellerMockKeys`, `adminMockKeys`

### 2. SubPhase 단위 PR 진행 정착
큰 phase (5, 6, 7) 는 sub-phase 로 쪼개 PR 단위를 리뷰 가능한 크기로 유지:
- **Phase 5**: 5a (Product Discovery) → refactor (검색바 통합) → 5b (Cart) → 5c (Checkout/Order)
- **Phase 6**: 6a (백엔드 정렬 발주/입고) → 6b (mock-only dashboard/members/products/orders/settlement/cs)
- **Phase 7**: 7a (백엔드 정렬 상품/카테고리) → 7b (백엔드 정렬 회원/알림/재고이력) → 7c (mock-only dashboard/sellers/policy/contents)

### 3. React 19 룰 회피 패턴
`react-hooks/set-state-in-effect` 룰 위반 시 **`key={...}` 로 sub-component remount**:
```tsx
// ❌ useEffect 안 setState
useEffect(() => { setForm(policy); }, [policy]);

// ✅ key 패턴 — props 가 바뀌면 자동 unmount/remount
<EditForm key={`${policy.x}-${policy.y}`} policy={policy} />
```
컴포넌트 분리 비용은 있지만 React 19 룰과 직관성을 동시에 확보.

### 4. zod + RHF: number 필드 처리
`z.coerce.number()` 는 input type 을 `unknown` 으로 만들어 RHF 타입 mismatch.
**해결**: `z.number()` + `register('field', { valueAsNumber: true })`. number 입력은 RHF 가 변환 후 zod 가 검증.

### 5. zod 의 `.default('')` 함정
선택 필드에 `.default('')` 적용 시 입력 타입(`optional`) 과 출력 타입(`string`) 가 어긋나 RHF resolver 가 타입 거부.
**해결**: `.default()` 제거 + `useForm` 의 `defaultValues` 에서 빈 값 제공.

### 6. Vercel Hobby 일일 한도 (5000)
빈번한 PR / 큰 PR 에서 자주 hit. 패턴:
- **빌드/타입체크/린트/commitlint** 는 영향 없음 → 머지 가능
- 24h 후 자동 리셋
- 대규모 작업 시 PR 분할 + 시간 분산 권장

---

## 🏭 Phase 6 — Seller

### Phase 6a — 발주 / 입고 (PR #33, 백엔드 정렬)

**범위**: 백엔드 실제 endpoint 6개 정렬, 발주 생성 → 입고 확정 → 이력 조정/취소 풀 흐름.

**신규/변경**:
- `types/api.ts` — Seller 도메인 타입 (PurchaseOrder / Receive 시리즈)
- `mocks/fixtures/purchase-orders.ts` — mutable state + helpers (재고 누적/차감 흉내)
- `mocks/handlers/seller.ts` 재작성 — 구 stub (stats/members/products/orders/settlement/cs) 전체 제거, 백엔드 실제 6 endpoint 만
- `lib/queries/seller.ts` 재작성 — 6 hooks
- `lib/schemas/purchase-order.ts` — zod + type-level guard
- `components/seller/` — 6 컴포넌트 (po-status-badge / purchase-order-form / receive-confirm-dialog / receive-row-actions / stock-order-view / stock-view)

**백엔드 endpoint**:
```
GET   /api/seller/purchase-orders            → PageResponse<PurchaseOrderListItem>
POST  /api/seller/purchase-orders            → PurchaseOrderRef
GET   /api/seller/stocks/receive-history     → PageResponse<ReceiveHistory>
PATCH /api/seller/stocks/receive             → ReceiveStockResponse
PATCH /api/seller/stocks/receive/{id}        → ReceiveAdjustResponse
PATCH /api/seller/stocks/receive/{id}/cancel → ReceiveCancelResponse
```

### Phase 6b — mock-only 6 페이지 (PR #34)

**범위**: dashboard / members / products / orders / settlement / cs — 백엔드 endpoint 미정. mock 으로 채워서 시연 가능.

**신규**:
- `types/api.ts` — 8 mock-only 타입 (가칭)
- `mocks/fixtures/seller-mock.ts` — mutable state + helpers
- `mocks/handlers/seller-mock.ts` — 10 endpoint
- `lib/queries/seller-mock.ts` — 10 hooks
- `components/seller/mock-notice.tsx` — 공통 안내 띠
- `components/seller/seller-{dashboard,members,products,product-options,order-status-badge,orders,order-detail,settlement,cs}-view.tsx`
- 페이지 8개 모두 stub → view 교체

---

## 👑 Phase 7 — Admin

### Phase 7a — 상품 / 카테고리 (PR #37, 백엔드 정렬)

**범위**: 백엔드 9 endpoint 정렬. 상품 CRUD / SKU 추가/삭제 / 재고 ± / 카테고리 생성·수정.

**신규**:
- `types/api.ts` — 9 Admin 타입 (ProductCreateRequest / AddSkuRequest / AdjustStockRequest / CategoryCreateRequest 등 + StockHistory)
- `mocks/fixtures/admin-products.ts` — 기존 mockProductSummaries/Details 의 mutable 에 작용. 재고 변경 시 totalStock/inStock/status 자동 재계산 + summary 동기화
- `mocks/handlers/admin.ts` 재작성 — 구 stub 전체 제거, 백엔드 9 endpoint 만
- `lib/queries/admin.ts` — 9 mutations. `buildAdjustHook('increase'|'decrease')` 로 increase/decrease hook 공통화
- `lib/schemas/admin.ts` — `productCreateSchema`, `categoryCreateSchema`
- `components/admin/` — 6 신규 (products-view / product-create-dialog / product-edit-dialog / product-detail-view / sku-section / categories-view)
- `components/layout/admin-sidebar.tsx` — "상품" / "카테고리" 메뉴 추가
- 페이지 3개 신규 (products, products/[id], categories)

### Phase 7b — 회원 / 알림 / 재고 이력 (PR #38, 백엔드 정렬)

**범위**: 백엔드 9 endpoint 추가 — admin 18 endpoint 전체 정렬 완료.

**신규/변경**:
- `types/api.ts` — `MemberAdmin` (status enum PENDING/ACTIVE/SUSPENDED/WITHDRAWN), `Notification` (type SOLD_OUT)
- `mocks/fixtures/admin-members.ts` — members / notifications / stock-histories mutable + helpers
- `mocks/handlers/admin.ts` — 10 endpoint 추가
- `lib/queries/admin.ts` — 9 hooks. `useSetBlacklist` 가 boolean prop 으로 POST/DELETE 자동 선택
- `components/admin/` — 5 신규 (member-status-badge / members-view / member-detail-view / notifications-view / stock-history-section)
- `admin-sidebar.tsx` — 회원 / 알림 메뉴 추가
- `admin-product-detail-view.tsx` — StockHistorySection 합성
- 페이지 3개 신규 (members, members/[id], notifications)
- `app/admin/members/page.tsx` — `useSearchParams` 사용 → `export const dynamic = 'force-dynamic'`

**Toss URL = single source** 적용: members 페이지의 status/keyword 필터 모두 URL searchParams. keyword 는 onBlur 시점 반영 (잦은 fetch 방지).

### Phase 7c — mock-only 4 페이지 (PR #40)

**범위**: dashboard / sellers / policy / contents — phase 1 stub 잔존. mock 으로 채움. Admin sidebar 7 메뉴 전체 동작 완료.

**신규**:
- `types/api.ts` — 5 mock-only 타입 (AdminDashboardStats / SellerApplication / SettlementPolicy / AdminBanner / SecurityLog)
- `mocks/fixtures/admin-mock.ts` — state + helpers
- `mocks/handlers/admin-mock.ts` — 9 endpoint
- `lib/queries/admin-mock.ts` — 10 hooks
- `components/admin/` — 5 신규 (mock-notice / dashboard-mock-view / sellers-view / policy-view / contents-view)
- 페이지 4 stub 모두 view 교체

**React 19 룰 회피**: `admin-policy-view.tsx` 의 form 을 sub-component 로 분리 + `key` 패턴 적용. policy 가 mutation 으로 갱신되면 form 자동 remount → defaultValues 재적용.

### 🏆 Admin 사이드바 메뉴 7개 전체 동작

| 메뉴 | 출처 | PR |
|---|---|---|
| 대시보드 | mock | 7c |
| 상품 | 백엔드 | 7a |
| 카테고리 | 백엔드 | 7a |
| 회원 | 백엔드 | 7b |
| 알림 | 백엔드 | 7b |
| 판매자 관리 | mock | 7c |
| 정산 정책 | mock | 7c |
| 컨텐츠 / 보안 로그 | mock | 7c |

---

## 🤖 Phase 8 — AI Chat (Skipped)

백엔드 미구현. 보류.

`components/layout/floating-ai-chat.tsx` 는 Sheet 껍데기만 유지 (Phase 2).
백엔드 추가 시 useAIChatStore + 메시지 스트리밍 구현 예정.

---

## ⚒️ Phase 9 — Quality (PR #41)

**범위**: 비정상 상황 (에러/지연/미존재) + 로그인 상태 UX + 이미지 최적화.

### 신규

```
# error / loading / not-found 표준화
app/error.tsx               # 루트 에러 바운더리
app/not-found.tsx           # 루트 404
app/{admin,seller,consumer/[storeDomain]}/error.tsx   # 도메인별
app/{admin,seller,consumer/[storeDomain]}/loading.tsx # 도메인별 skeleton

# 로그인 상태 UI
components/layout/user-menu.tsx              # consumer top nav dropdown
components/layout/sidebar-logout-button.tsx  # admin/seller sidebar
```

### 수정
- `top-navigation.tsx` — 마이페이지+로그인 link → `<UserMenu />` 하나로 통합 (로그인 상태별 자동 분기)
- `admin-sidebar.tsx` / `seller-sidebar.tsx` — 하단 user 영역을 `useMe` + 로그아웃 버튼으로 교체. "TODO: 인증 연결" 문구 제거
- `next.config.ts` — `images.remotePatterns` 에 picsum.photos 등록
- `product-card.tsx` / `product-detail-view.tsx` / `cart-item-row.tsx` — `<img>` → `<Image>` (fill + sizes). 상세에는 `priority` (LCP 후보)

### 로그아웃 처리
이미 Phase 4 의 `useLogout` 이 `onSettled` 에서 `clearToken()` + `queryClient.clear()` 호출. 별도 추가 작업 없이 적용.

---

## 🐛 트러블슈팅 노트 (Phase 6~9 추가)

### Vercel Hobby 일일 5000 한도
5b, 7c, 9 에서 hit. 24h 자동 리셋. 머지에는 영향 없음 — 코드 검증 CI 는 정상 통과.

### React 19 `react-hooks/set-state-in-effect` 룰
useEffect 안 setState 금지. props 동기화는 `key={...}` 로 컴포넌트 remount 패턴 사용.
적용 사례: `admin-policy-view.tsx`, `auth/callback/page.tsx` (Phase 4).

### zod + RHF number 필드
`z.coerce.number()` 대신 `z.number()` + `register('field', { valueAsNumber: true })`.

### zod `.default('')` 제거
optional 필드의 입력/출력 타입 mismatch 회피.

### shadcn (base-ui) Dialog `render` prop
`<DialogTrigger render={<Button .../>}>...</DialogTrigger>` 패턴 일관 적용 (Phase 2 부터 정착).

### Next 16 `useSearchParams` 정적 prerender 충돌
`useSearchParams` 사용하는 페이지는 빌드 시 prerender 에러. 해당 page.tsx 에 `export const dynamic = 'force-dynamic';` 명시.
적용: `app/admin/members/page.tsx`.

### CartItemResponse 의 skuId 부재
백엔드 응답에 skuId 가 없어 cart → order 변환 시 fallback (`productId * 100 + 1`) 사용.
백엔드에 추가 요청됨 (`checkout-view.tsx` 의 TODO 주석 참조).

---

## 📋 PR 인덱스 (Phase 6~9)

| # | 제목 | 베이스 |
|---|---|---|
| 33 | feat: phase 6a — 판매자 발주 / 입고 | dev |
| 34 | feat: phase 6b — seller mock-only 6 페이지 | dev |
| 37 | feat: phase 7a — admin 상품 / sku / 카테고리 | dev |
| 38 | feat: phase 7b — admin 회원 / 알림 / 재고 이력 | dev |
| 40 | feat: phase 7c — admin mock-only 4 페이지 | dev |
| 41 | feat: phase 9 — error / loading / usermenu / next image | dev |

---

## 📡 백엔드 팀에 누적된 요청 (지금 즉시는 X)

다음 phase 진입 / 백엔드 정렬 시 확인:

### 일반
- 상품 정렬 옵션 (`?sort=` 허용 필드)
- 이미지 호스팅 도메인 — Next Image `remotePatterns` 등록 필요
- storeDomain 멀티테넌시 정책 — 현재 URL prefix 만, BE 무시
- 검색 페이지 크기 최댓값 (`size=` 제한)

### Cart / Order
- 같은 productId 두 번 담을 때 quantity 누적 정책
- 재고 초과 quantity 요청 시 status / 메시지
- **CartItemResponse 에 skuId 추가** (현재 fallback 으로 productId * 100 + 1 사용)
- 주문 성공 시 cart 자동 비움 정책 확인
- `OrderResponse.status` enum 확장 (배송 추적 단계)

### Seller
- SKU 별 현재 재고 endpoint 부재 — `ReceiveHistory.stockAfter` 로 추정 중
- 발주 목록의 `expectedAt` timezone 명시
- mock-only 영역 endpoint 정책 — dashboard stats / 회원 / 정산 / CS 가 admin 으로 통합됐는지 확인

### Admin
- admin 전용 GET endpoint 부재 — `/api/admin/products` GET, `/api/admin/categories` GET 없어서 consumer 재사용 중
- `POST /api/admin/products` 응답에 SKU 없음 (생성 직후 SOLD_OUT 정상)
- 블랙리스트 응답 status — 현재 SUSPENDED 와 구분 어려움. BLACKLISTED enum 추가 권장
- 알림 type — SOLD_OUT 만 정의. 향후 확장 시 매핑 필요
- mock-only path 컨벤션 (`/api/admin/dashboard/stats` 등) 확정 시 마이그레이션

### Auth
- `POST /api/auth/logout` 동작 확인 — 200 + 빈 body 가정. refresh token 무효화 추가 동작이 있는지

---

## 🗺️ 남은 작업

### 진행 예정
- **Jest 단위 테스트** — 셋업 + 핵심 utils / components 커버
- **Lighthouse CI** — 렌더링 비용 / Performance / Accessibility / Best Practices / SEO 자동 측정

### 보류
- **Phase 8 (AI Chat)** — 백엔드 endpoint 추가 시
- **동적 metadata** — 상품 상세 등 server-side fetch 가능 시점에 `generateMetadata` 도입
- **접근성 audit 심화** — heading hierarchy / focus management / keyboard navigation
- **mock 정렬 완료** — `reviews / qna / ai` 핸들러는 백엔드 미구현이라 유지

### 운영
- 백엔드 배포 후 Vercel `NEXT_PUBLIC_API_BASE_URL` 등록 + OAuth 흐름 검증
- CORS / Google OAuth redirect URL 갱신 (Phase 0~4 기록 참조)
