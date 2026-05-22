# AI 맞춤 추천 이커머스 플랫폼 — Frontend

> Next.js 16 App Router 기반 B2B2C 멀티테넌시 이커머스 프론트엔드.
> 관리자(Admin) / 판매자(Seller) / 소비자(Consumer) 3 역할.

## 🔗 링크

| | |
|---|---|
| Production | https://ecommerce-frontend-six-kohl.vercel.app |
| Backend image | `kwondh1126/ecommerce-be:latest` (Docker Hub) |
| OpenAPI 스펙 | `api/api-docs.json` |

---

## 🧱 기술 스택

| 분류 | 사용 |
|---|---|
| 프레임워크 | Next.js 16.2 (App Router, Turbopack) |
| 언어 / 런타임 | TypeScript · React 19 · Node 20+ |
| 스타일링 | Tailwind CSS v4 · Shadcn UI (`@base-ui/react` 기반) · Lucide |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand (persist) |
| 폼 | React Hook Form + Zod (form-level cohesion) |
| API 모킹 | MSW v2 |
| 인증 | Bearer JWT — Google OAuth (`localStorage` 보관) |
| 테스트 | Jest + Testing Library |
| 성능 측정 | Lighthouse CI |
| 코드 리뷰 | CodeRabbit AI (한국어) |
| 배포 | Vercel (GitHub Actions deploy) |

---

## 📂 디렉토리 구조

```
app/                  Next.js App Router 페이지
  (auth)/             Route Group (URL 미반영)
  admin/ seller/ consumer/[storeDomain]/   실제 segment
  proxy.ts            호스트네임 기반 rewrite (Next 16 의 구 middleware)
components/
  ui/                 shadcn 자동 생성 (수정 자제 / lint·리뷰 제외)
  layout/             AdminSidebar / SellerSidebar / TopNavigation / FloatingAIChat / UserMenu
  consumer/ seller/ admin/ auth/   도메인별 view·dialog·badge 등
lib/
  api/client.ts       apiFetch (Bearer 자동 주입, base URL prefix)
  auth/               Zustand store + useMe / useLogout
  queries/            도메인별 TanStack Query hooks + queryKey 팩토리
  schemas/            zod 스키마 (백엔드 request 타입과 type-level guard)
  format.ts utils.ts  유틸
mocks/
  fixtures/           도메인별 mutable mock 데이터
  handlers/           MSW 핸들러 (도메인별)
  browser.ts server.ts
types/api.ts          백엔드 OpenAPI 응답 / request 타입 (1:1 미러)
api/api-docs.json     백엔드 OpenAPI 3.1 스펙 — 단일 출처
```

---

## 🚀 시작하기

### 1. 환경 변수

```bash
cp .env.example .env
# 에디터로 빈 값 채우기 — Google OAuth / JWT / DB 등은 BE 팀이 dev 키 공유
```

| 키 | 용도 |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 base URL (로컬: `http://localhost:8080`) |
| `NEXT_PUBLIC_API_MOCKING` | `enabled` 면 production build 에서도 MSW 강제 활성 (백엔드 없이 시연용) |
| `GOOGLE_CLIENT_ID/SECRET` · `JWT_SECRET` · `DB_*` · `KAKAO_*` · `NAVER_*` | Docker compose 의 BE 컨테이너에 주입되는 secret |

### 2. 프론트만 띄우기 (MSW 로 백엔드 대체)

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 3. 백엔드까지 통합 (Docker)

```bash
docker compose up -d        # MySQL + ecommerce-be 컨테이너 (8080)
npm run dev                 # FE 는 호스트에서 (3000)
```

상세 가이드: [`docs/docker-local-dev.md`](docs/docker-local-dev.md)

---

## 🛠️ 자주 쓰는 명령어

```bash
npm run dev          # Next.js dev (turbopack, MSW 자동 활성)
npm run build        # production 빌드
npm start            # production 서버

npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Jest 단위 테스트
npm run test:watch   # Jest watch 모드
npm run lighthouse   # Lighthouse CI (build → start → 측정)
```

문제 해결:

```bash
# dev 서버가 stale 캐시 / 포트 점유로 이상 동작
pkill -f "next dev" && rm -rf .next && npm run dev
```

---

## 🌳 워크플로

```
1. 최신 sync
   git fetch origin --prune
   git checkout -b feature/<scope> origin/dev   # 또는 chore/ refactor/ ci/ docs/ test/

2. 코드 작성
   - api/api-docs.json 에서 endpoint 먼저 확인
   - types/api.ts 에 타입 1:1 미러
   - mocks/handlers/* 가 백엔드 스키마와 일치하는지 확인
   - lib/queries/* — useXxx 는 UseQueryResult / UseMutationResult 일관 반환
   - .claude/toss-frontend-rules.md 의 원칙 적용 (named constants / SRP / composition)

3. 로컬 검증
   npm run lint && npm run typecheck && npm test && NEXT_TELEMETRY_DISABLED=1 npm run build

4. 커밋 (Conventional Commits, subject 전부 lowercase)
   git commit -m "feat: <한국어 요약>"

5. 푸시 + PR
   git push -u origin <branch>
   gh pr create --base dev --title "..." --body "..."

6. CI 자동 실행 (6개)
   - Lint · Typecheck · Build
   - Validate commit messages (commitlint)
   - Jest unit tests
   - Render cost / Performance audit (Lighthouse)
   - Deploy preview (Vercel)
   - CodeRabbit Review (한국어)
```

규칙:
- **PR 베이스**: `dev` (절대 `main` 으로 직접 PR 금지)
- **커밋 타입**: `feat · fix · docs · style · refactor · perf · test · chore · ci · revert · build`
- **커밋 subject**: 전부 lowercase (대문자 토큰 금지: `PR ❌` → `pr ✅`)
- **브랜치명**: `feature/* chore/* refactor/* ci/* docs/* test/*` — 머지 후 자동 삭제
- **PR 본문**: `.github/PULL_REQUEST_TEMPLATE.md` 따름

---

## 🤖 CI / 자동화

`.github/workflows/`

| 워크플로 | 트리거 | 작업 |
|---|---|---|
| `ci.yml` | PR + push (dev/main) | lint / typecheck / build |
| `commitlint.yml` | PR | 모든 커밋 Conventional Commits 검증 |
| `test.yml` | PR + push (dev/main) | `npm test` (Jest) |
| `lighthouse.yml` | PR | Lighthouse CI (warn 모드, MSW 강제 활성) |
| `vercel-preview.yml` | PR + dev push | Preview 배포 + PR 코멘트 |
| `vercel-production.yml` | main push | Production 배포 (`--prod`) |

CodeRabbit AI 리뷰는 별도 — `.coderabbit.yaml` (한국어, `base_branches: dev` 포함).

---

## 🧭 핵심 원칙

1. **백엔드 단일 출처** — `api/api-docs.json` 이 single source of truth. 새 endpoint 작업 시 항상 먼저 확인. mock 핸들러 / queryKey / 타입은 백엔드 스키마 그대로 복제
2. **응답 envelope 금지** — 백엔드는 객체/배열을 직접 반환. mock 도 동일 (`{ data: ... }` 래핑 X)
3. **라이트 테마 단일** — `dark:` 클래스 / 다크 토큰 신규 추가 금지
4. **as-we-go mock 정렬** — Phase 진행 중 사용처 생길 때 해당 도메인 mock 을 백엔드로 정렬
5. **백엔드 미구현 기능** — `<ComingSoonSection />` 또는 disabled UI 로 명시 (숨기지 말 것)
6. **Toss 가이드** — `.claude/toss-frontend-rules.md` (Readability / Predictability / Cohesion / Coupling)

---

## ⚠️ 자주 헷갈리는 지뢰

| 지뢰 | 정답 |
|---|---|
| `middleware.ts` | **`proxy.ts`** (Next 16 명칭 변경) |
| 동적 page `params: { id: string }` | **`Promise<{ id: string }>`** + `await params` (Next 16) |
| `<Button asChild><Link>` | **`<Link className={cn(buttonVariants(...))}>`** (Base UI 는 `asChild` 없음) |
| `<SheetTrigger asChild><Button>` | **`<SheetTrigger render={<Button .../>}>`** |
| 다크 테마 클래스 (`dark:bg-...`) | **금지** — 라이트 단일 정책 |
| 응답 envelope `{ data: ... }` | **금지** — 백엔드는 직접 반환 |
| Commit subject 대문자 | **금지** — commitlint 가 lowercase 강제 |
| `feature/* → main` PR | **금지** — 무조건 `dev` 베이스 |
| useEffect 안 setState | **금지** (React 19) — `key` 패턴으로 컴포넌트 remount |
| RHF number 필드 + zod | **`register({ valueAsNumber: true })`** + `z.number()` |
| Mock handler 의 절대 URL | **`*/api/...` 와일드카드** — 절대/상대 둘 다 매치 |

---

## 📚 참고 문서

세션 / 컨텍스트:
- `.claude/ai-onboarding.md` — **새 AI 에이전트 / 컨트리뷰터 진입 가이드**
- `.claude/phase-0-to-4-setup.md` — 인프라 / 라우팅 / UI / MSW / 인증 기록
- `.claude/phase-5-progress.md` — Phase 5 (Consumer)
- `.claude/phase-6-to-9-progress.md` — Phase 6 / 7 / 9 + Jest + Lighthouse
- `.claude/toss-frontend-rules.md` — 코딩 가이드

설계 / 운영:
- `project_architecture.md` — 초기 전체 설계서 (백엔드 실제와 일부 다름)
- `api/api-docs.json` — 백엔드 OpenAPI 3.1 (단일 출처)
- `docs/docker-local-dev.md` — Docker 로컬 환경
- `docs/husky.md` — 커밋 규약

---

## 🌐 배포 환경에서 로그인 활성화

기본값은 `localhost:8080` 이라 배포본에선 OAuth 가 동작하지 않음. 백엔드 배포 후:

1. 백엔드 공개 URL 확보 + OAuth 콜백 URL 환경변수화 (`FRONT_BASE_URL`)
2. CORS allowlist 에 Vercel 도메인 추가
3. Google Cloud Console OAuth 설정 갱신
4. Vercel env 에 `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com` 등록
5. 재배포

백엔드 미배포 시 임시 시연: Vercel env 에 `NEXT_PUBLIC_API_MOCKING=enabled` 등록 (OAuth 자체는 못 하고 화면만).
