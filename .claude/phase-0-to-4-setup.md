# 프로젝트 셋업 기록 — Phase 0 ~ 4

> 2026-04-27 ~ 2026-05-11 의 Claude Code 세션 기록.
> 인프라 셋업 + 라우팅 / UI 골격 + MSW + Google OAuth 까지.

---

## 📦 프로젝트 개요

| 항목 | 값 |
|---|---|
| 레포 | `capstone-P23/ecommerce-frontend` |
| 스택 | Next.js 16.2.4 (App Router, Turbopack) · React 19.2.4 · TypeScript · Tailwind 4 · Shadcn (Base UI) · TanStack Query · Zustand · MSW · React Hook Form · Zod |
| 백엔드 | Java/Spring (별도 레포). `localhost:8080`. OpenAPI 스펙: `api/api-docs.json` |
| 배포 | Vercel (`https://ecommerce-frontend-six-kohl.vercel.app`) |
| 브랜치 전략 | `feature/* → dev → main`, PR 단위 진행 |

---

## 🛠️ 인프라 셋업 (Phase 0 이전)

### PR #3 — CI / PR 템플릿
**파일**: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ci.yml`, `.github/workflows/commitlint.yml`

- **CI**: `pull_request` + `push` (dev/main) 트리거 → Node 20 → `npm ci` (HUSKY=0) → `lint` → `typecheck` (`tsc --noEmit`) → `build`
- **Concurrency**: `cancel-in-progress: true` — 새 커밋 올라오면 이전 실행 자동 취소
- **Commitlint**: PR 의 모든 커밋이 Conventional Commits 규약 따르는지 검증
- **PR 템플릿**: 요구사항 no, 테스트 플랜, 체크리스트 포함

`package.json` 에 `"typecheck": "tsc --noEmit"` 스크립트 추가.

### Vercel CI/CD (Phase 0 PR 안에 포함)
**파일**: `.github/workflows/vercel-preview.yml`, `vercel-production.yml`

- **Preview**: PR + `dev` push → preview 배포 + PR 코멘트 자동 갱신
- **Production**: `main` push → `--prod` 배포
- **Required secrets**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

**Vercel 프로젝트 생성** (Claude 가 CLI 로 직접 진행):
- `npx vercel link --yes --project ecommerce-frontend --scope kss2002s-projects`
- `prj_7TwYCbHKGFUH3DyjQMjlAPk97FRw`, `team_C3wxKncLEdriGblCX3mVoJTV`
- 사용자가 `VERCEL_TOKEN` 만 대시보드에서 발급해 `gh secret set` 으로 등록

**권한 이슈** (PR #7 에서 수정):
- `actions/github-script` 가 PR 코멘트 POST 시 403 → 워크플로 잡 레벨에 `permissions: pull-requests: write` 추가

---

## 🚀 Phase 0 — Foundations (PR #5)

### 의존성 추가
**runtime**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`
**dev**: `@tanstack/react-query-devtools`, `msw`

### Shadcn 초기화
- `npx shadcn@latest init -d --yes`
- 출력: `components.json` (baseColor: neutral, lucide), `components/ui/button.tsx`, `lib/utils.ts`, `app/globals.css`
- **`@base-ui/react`** 기반 (구 Radix 아님!)
- 자동 추가된 deps: `shadcn`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tw-animate-css`, `next-themes`

### 라이트 테마 단일 정책
사용자 결정. `app/globals.css` 에서 `.dark` / `@custom-variant dark` **의도적으로 제거**.

### Providers
**파일**: `app/providers.tsx`
- `'use client'` Component
- TanStack Query QueryClient (staleTime 60s, refetchOnWindowFocus false)
- Devtools (개발 환경 한정)

### 루트 layout
- metadata 갱신: `AI 맞춤 추천 이커머스 플랫폼`
- `<Providers>` 로 children 래핑

---

## 🛣️ Phase 1 — Routing Skeleton (PR #9)

### 핵심 발견 — Next.js 16 변경사항
`AGENTS.md` 의 경고대로 `node_modules/next/dist/docs/` 를 읽어 확인:

| 항목 | Next 14 | Next 16 |
|---|---|---|
| 미들웨어 파일 | `middleware.ts` | **`proxy.ts`** |
| 함수명 | `middleware` | **`proxy`** |
| 동적 페이지 `params` | `{ id: string }` | **`Promise<{ id: string }>`** (await 필요) |

### 설계 보정
원래 설계의 `(admin)` / `(seller)` / `(consumer)` Route Group 은 **빌드 충돌**:
- `(admin)/dashboard/page.tsx` → URL: `/dashboard`
- `(seller)/dashboard/page.tsx` → URL: `/dashboard` ← 충돌
- 해결: 실제 segment `admin/`, `seller/`, `consumer/[storeDomain]/` 사용. `(auth)` 만 Route Group 유지

### 추가된 것
- 페이지 스텁 28 개 (auth 2, admin 6, seller 11, consumer 6, root 1) + 레이아웃 3
- `proxy.ts` — 호스트네임 기반 rewrite (admin.host → /admin, seller.host → /seller, {x}.host → /consumer/{x})
- `app/page.tsx` — 로컬 dev 진입 (역할별 링크)
- 설계서 3장, 4장 갱신
- ESLint `globalIgnores` 에 `.vercel/**` 추가

---

## 🎨 Phase 2 — Common UI + Layouts (PR #11)

### Shadcn primitives 13 개
`npx shadcn@latest add` 일괄: `input, label, select, card, sheet, dialog, tabs, badge, avatar, separator, skeleton, dropdown-menu, sonner`

### 핵심 발견 — Base UI 패턴
shadcn 4.x 가 **`@base-ui/react`** 기반으로 변경됨 (구 Radix 와 다름):

| 패턴 | Radix 시절 | Base UI |
|---|---|---|
| 자식 합성 | `<X asChild><Link>` | `<X render={<Element/>}>` |
| Button as Link | `<Button asChild><Link>` | **`buttonVariants` 로 Link 에 className 적용** (HTML `<a>` in `<button>` 무효 케이스도 회피) |

`sonner.tsx` 의 `useTheme` 의존 → `theme="light"` 하드코딩으로 교체 (next-themes 미사용).

### 레이아웃 컴포넌트 5 개
- `admin-sidebar.tsx`, `seller-sidebar.tsx` — 활성 path 강조 (`pathname.startsWith(href)`)
- `top-navigation.tsx` — Consumer GNB (스토어명 / 검색 / 장바구니/마이페이지/로그인)
- `floating-ai-chat.tsx` — `[AI-001]` Sheet 패널 껍데기
- `auth-shell.tsx` — login/signup 카드 wrapper

루트 `layout.tsx` 에 `<Toaster />` 추가.

---

## 🧪 Phase 3 — MSW + queryKey 팩토리 (PR #12)

### MSW 셋업
- `npx msw init public/` → `public/mockServiceWorker.js` 생성
- ESLint 에 워커 파일 ignore 추가
- `package.json` 에 `"msw.workerDirectory"` 추적 필드 자동 추가

### mocks/ 트리 (15 files)
```
fixtures/   products / orders / users (sellers 포함)
handlers/   auth / products / orders / members / reviews / qna / ai
            seller / admin / index
browser.ts  setupWorker (dev/preview)
server.ts   setupServer (vitest 후속)
```

설계서 9 장의 모든 endpoint 핸들러 스텁. 응답 envelope: `{ data: ... }` 통일.

### lib/queries/ — queryKey 팩토리 (8 files)
설계서 7-1 장 패턴:
```ts
export const productKeys = {
  all: ['products'] as const,
  detail: (id) => [...productKeys.all, 'detail', String(id)] as const,
  search: (keyword) => [...productKeys.searches(), keyword] as const,
};
```

### app/providers.tsx — MSW 부트스트랩
```ts
const isMockingEnabled =
  process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' ||
  process.env.NODE_ENV === 'development';
```

- **dev**: 항상 on
- **preview/production**: `NEXT_PUBLIC_API_MOCKING=enabled` opt-in
- `worker.start()` 완료 전까지 children 렌더 보류 (race 방지)

---

## 🔐 Phase 4 — Google OAuth + Bearer 인증 (PR #14)

### 백엔드 명세 통합
사용자가 백엔드로부터 `api/api-docs.json` (OpenAPI 3.1) 받아옴 → 1754 lines, 레포에 커밋.

**핵심 발견**:
- 백엔드는 **Google OAuth 만** 구현 (이메일/비번 미구현)
- Bearer JWT 인증 (`bearerAuth` security scheme)
- 베이스 URL: `http://localhost:8080`
- 설계서 9 장의 mock endpoint 들과 백엔드 실제 endpoint 가 상당히 다름

### OAuth 흐름
```
1. /login 의 Google 버튼 클릭
2. → http://localhost:8080/oauth2/authorization/google (full reload)
3. Google 동의 → 백엔드 callback
4. → http://localhost:3000/auth/callback#accessToken=... (hash fragment)
5. /auth/callback 페이지가 hash 파싱 → store 저장 → / 이동
```

### 신규 인프라
- `.env.example` — `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- `.gitignore` — `!.env.example` 예외 추가
- **`lib/api/client.ts`** — `apiFetch<T>()` wrapper (base URL prefix, Bearer 자동 주입, `ApiError` 클래스)
- **`lib/auth/store.ts`** — Zustand persist, `accessToken` localStorage 보관 (XSS 절충안)
- **`lib/auth/queries.ts`** — `useMe()` (GET /api/members/me), `useLogout()` (POST /api/auth/logout)

### OAuth 페이지
- `components/auth/google-login-button.tsx` — native `<a>` (Next Link 아님)
- `app/auth/callback/page.tsx` — hash 파싱은 **`useState` initializer 에서** (React 19 `react-hooks/set-state-in-effect` 룰 회피)
- `app/(auth)/login/page.tsx` — Google 버튼만 + "이메일 로그인 추후 지원" 안내
- `app/(auth)/signup/page.tsx` — "Google 로그인 시 자동 가입" 안내

### proxy.ts 갱신
`/auth/*` 통과 처리 추가 (admin/seller subdomain 매칭에 안 잡히게).

### Mock 정렬 (auth + members/me 만)
- `mocks/handlers/auth.ts` — 구 `/api/members/login` 등 제거. `POST */api/auth/refresh`, `POST */api/auth/logout` 추가
- `mocks/handlers/members.ts` — `GET */api/members/me` 추가 (MemberResponse 스키마 일치)
- `*` origin 와일드카드 적용 (절대 URL `http://localhost:8080/...` 도 인터셉트)

---

## 🧭 횡단 결정 (Cross-cutting Decisions)

### 1. 라이트 테마 단일 운영
- 다크 토큰 / 변형 의도적으로 미적용
- `sonner.tsx` 의 `useTheme` 도 제거
- `next-themes` 는 deps 에 남아있지만 미사용

### 2. 백엔드 단일 출처 원칙 (Phase 4 이후)
- `api/api-docs.json` 이 single source of truth
- 새 endpoint 추가 시 OpenAPI 스펙 먼저 확인
- mock 핸들러 / queryKey / 타입은 백엔드 응답 스키마 그대로 복제
- 설계서 9 장은 derived doc 으로 강등
- **방법론**: as-we-go 정렬 (Phase 5+ 에서 endpoint 별로)

### 3. 브랜치 전략
- `feature/* → dev → main`
- 모든 변경은 PR 단위 (직접 커밋 금지)
- 머지 후 PR 브랜치 자동 삭제
- 일부 phase 결정 / cleanup 은 main worktree dev 직접 푸시 (이 문서처럼)

### 4. Conventional Commits
`commitlint.config.js`:
- 타입: `feat / fix / docs / style / refactor / perf / test / chore / ci / revert / build`
- 모두 lowercase (subject 포함 — 대문자 토큰 금지: `PR` ❌, `pr` ✅)

### 5. 보안 노트 (auth)
- `accessToken` 을 localStorage 에 보관 — XSS 취약
- 이유: 백엔드가 hash fragment 로 토큰 던지는 흐름이라 클라이언트가 받아 저장해야 함
- 마이그레이션 노트: 백엔드가 httpOnly 쿠키로 발급하도록 변경 시 store 는 marker 로만 축소

---

## 🐛 트러블슈팅 노트

### `npm install` 후 dev 가 stale 캐시로 실패
**증상**: `Module not found: Can't resolve '@tanstack/react-query'` 등이 의존성 설치 후에도 지속

**원인**:
1. 기존 `next dev` 프로세스가 살아 있어서 새 서버가 못 뜸 (포트 점유)
2. Turbopack `.next/` 캐시가 옛 모듈 그래프를 들고 있음

**해결**:
```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

**예방**: PR 머지 후 워크플로
```bash
git pull && npm install && pkill -f "next dev" && rm -rf .next && npm run dev
```

### ESLint 가 `.vercel/output/**` 스캔
로컬 `vercel build` 산출물의 minified 파일을 lint 가 검사 → `eslint.config.mjs` `globalIgnores` 에 `.vercel/**`, `public/mockServiceWorker.js` 추가.

### React 19 의 `react-hooks/set-state-in-effect` 룰
useEffect 안에서 setState 호출 금지. URL hash 파싱 같은 1회성 초기화는 **`useState(init함수)`** 패턴으로 회피.

### Vercel preview URL 401
팀 단위 preview URL (`*-{team}.vercel.app`) 은 Hobby 기본 보호 (Vercel Authentication). 공개 alias (`<project>-{hash}.vercel.app`) 사용하거나 대시보드에서 보호 해제.

### CI 의 GITHUB_TOKEN read-only
2023 년부터 기본 read-only. PR 코멘트 작성 등은 워크플로 잡 레벨 `permissions:` 명시 필요.

---

## 📋 PR 인덱스

| # | 제목 | 베이스 |
|---|---|---|
| 1 | docs: 프론트엔드 아키텍처 설계서 추가 | main |
| 2 | (자동) | main |
| 3 | ci: pr 템플릿과 github actions 워크플로 추가 | dev |
| 5 | feat: phase 0 foundations | dev |
| 7 | ci: vercel preview 워크플로 권한 부여 | dev |
| 9 | feat: phase 1 라우팅 골격 + proxy.ts | dev |
| 11 | feat: phase 2 - 공통 UI + 역할별 레이아웃 | dev |
| 12 | feat: phase 3 - MSW 핸들러 + queryKey 팩토리 | dev |
| 14 | feat: phase 4 - Google OAuth + Bearer 인증 | dev |

---

## 🗺️ 남은 Phase

### Phase 5 — Consumer 핵심 동선 (다음)
- 홈 (PRD-002,003) → 상품 검색 (PRD-001) → 상품 상세 (PRD-004, REV-001, QNA-001)
- 장바구니 (ORD-001, Zustand) → 체크아웃 (ORD-002, PAY-001/002)
- 마이페이지 주문 조회 (MEM-003, ORD-003/004)
- 좋아요/찜/최근 본 (INT-001/002/003) — 백엔드 미구현 항목 별도 표시

### Phase 6 — Seller 영역
대시보드 / 상품 옵션 / 주문 / 재고·발주 / 정산 / CS / 회원 관리

### Phase 7 — Admin 영역
대시보드 / 판매자 승인·등급 / 정책 / 컨텐츠·로그

### Phase 8 — AI 대화형 추천 (백엔드 미구현)
`FloatingAIChat` 실제 구현 + 스트리밍

### Phase 9 — 품질 보강
에러 바운더리 / loading.tsx · error.tsx · not-found.tsx / 접근성 / SEO 메타 / 이미지 최적화

---

## 🔗 운영 메모

### Vercel 프로젝트
- 프로젝트: `kss2002s-projects/ecommerce-frontend`
- Production: `https://ecommerce-frontend-six-kohl.vercel.app`
- 워크플로: GitHub Actions 가 직접 `vercel deploy` (Vercel Git Integration 미사용)

### GitHub Secrets 등록 상태
- `VERCEL_TOKEN` ✅
- `VERCEL_ORG_ID` ✅ (`team_C3wxKncLEdriGblCX3mVoJTV`)
- `VERCEL_PROJECT_ID` ✅ (`prj_7TwYCbHKGFUH3DyjQMjlAPk97FRw`)

### 배포 환경에서 로그인 활성화 (백엔드 배포 후)
1. 백엔드 공개 URL 확보
2. 백엔드의 OAuth 콜백 URL 환경변수화 (`FRONT_BASE_URL`)
3. CORS allowlist 에 Vercel 도메인 추가
4. Google Cloud Console OAuth 설정 갱신
5. Vercel env 에 `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com` 등록
6. 재배포

백엔드 미배포 시 임시 데모: ngrok / cloudflared 터널 또는 `NEXT_PUBLIC_API_MOCKING=enabled` (OAuth 자체는 못 하고 화면만).
