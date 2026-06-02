# AI 에이전트 진입 가이드

- 이 프로젝트는 여러 Phase 로 나뉘어 진행 중입니다.
- 새 세션에서 코드를 짜기 전에 다음 순서로 컨텍스트를 회복하세요.

## 📖 첫 5분 — 필수 읽기

순서대로:

1. **`AGENTS.md`** (1줄) — Next.js 16 호환성 경고
2. **이 파일** — 진입 가이드 + 컨벤션 요약
3. **`.claude/phase-5-progress.md`** — 가장 최신 진행 상황. **여기 끝에 "남은 Phase 작업 가이드" 가 있음**
4. **`.claude/phase-0-to-4-setup.md`** — 인프라 / 라우팅 / UI / MSW / 인증 기록
5. **`.claude/toss-frontend-rules.md`** — 코딩 가이드 (Readability / Predictability / Cohesion / Coupling)

참고 (필요할 때 읽기):
- **`api/api-docs.json`** — **백엔드 단일 출처**. 새 endpoint 작업 시 항상 먼저 확인
- **`project_architecture.md`** — 초기 전체 설계서. 백엔드 실제와 일부 다름 (PRD-002 추천 등 백엔드 미구현)
- **`docs/docker-local-dev.md`** — 로컬 BE+DB 띄우는 법
- **`docs/husky.md`** — 커밋 규약

## 🚨 자주 헷갈리는 지뢰 (이 프로젝트 특화)

| 지뢰 | 정답 |
|---|---|
| `middleware.ts` | **`proxy.ts`** (Next 16 에서 이름 바뀜) |
| `params: { id: string }` | **`params: Promise<{ id: string }>`** + `await params` (Next 16) |
| `<Button asChild><Link>` | **`<Link className={cn(buttonVariants(...))}>`** (이 shadcn 은 base-ui — asChild 없음) |
| `<SheetTrigger asChild><Button>` | **`<SheetTrigger render={<Button .../>}>`** |
| 다크 테마 클래스 (`dark:bg-...`) | **금지** — 라이트 단일 운영 정책 |
| 응답 envelope `{ data: ... }` | **금지** — 백엔드는 객체/배열 직접 반환, mock 도 동일 |
| Commit subject 대문자 | **금지** — Conventional Commits + commitlint 가 lowercase 강제 |
| `feature/* → main` PR | **금지** — 무조건 `dev` 베이스 |
| Mock handler 의 절대 URL | **`*/api/...` 와일드카드 사용** — 절대/상대 둘 다 매치 |

## 🛣️ 워크플로 (변경 ↔ 머지)

```
1. 최신 sync
   git fetch origin --prune
   git checkout -b feature/<scope> origin/dev   # 또는 chore/, refactor/, ci/, docs/

2. 코드 작성 (Toss 규칙 적용)
   - api-docs.json 으로 스키마 먼저 확인
   - types/api.ts 에 타입 추가/정합
   - mocks/handlers/ 백엔드 스키마와 일치
   - lib/queries/ — UseQueryResult / UseMutationResult 일관 반환
   - 컴포넌트 — single responsibility, named constants

3. 검증
   npm run lint && npm run typecheck && NEXT_TELEMETRY_DISABLED=1 npm run build

4. 커밋 (Conventional Commits, lowercase subject)
   git commit -m "feat: <소문자 한국어 요약>" -m "본문..."

5. 푸시 + PR
   git push -u origin <branch>
   gh pr create --base dev --title "..." --body "..."

6. CI 통과 확인 (5개)
   - Lint · Typecheck · Build
   - Validate commit messages (commitlint)
   - Deploy preview (Vercel)
   - CodeRabbit Review (한국어)
   - (자동) PR 코멘트로 preview URL 등록
```

## 🗂️ 코드 위치 규약

```
app/                          # Next 16 App Router 페이지
  (auth)/                     # route group — URL 미반영
  admin/ seller/ consumer/    # 실제 segment
  proxy.ts                    # ← middleware 의 대체 (Next 16)
components/
  ui/                         # shadcn 자동 생성 (직접 수정 자제, lint/리뷰 제외)
  layout/                     # 사이드바·헤더·푸터
  consumer/ ...               # 도메인별 묶음
lib/
  api/client.ts               # apiFetch (Bearer 자동 주입)
  auth/                       # 인증 store / queries
  queries/                    # TanStack Query hooks (도메인별 파일)
  format.ts utils.ts          # 유틸
mocks/
  fixtures/                   # mutable mock 데이터
  handlers/                   # MSW 핸들러 (도메인별)
  browser.ts server.ts        # MSW 셋업
types/
  api.ts                      # 백엔드 응답 타입 (api-docs.json 미러)
```

## ⚙️ 코드 작성 전 체크리스트

새 endpoint / 새 페이지 / 새 컴포넌트 작업 전:

- [ ] **`api/api-docs.json`** 에서 endpoint + 스키마 확인 (백엔드 미구현이면 placeholder 처리)
- [ ] **`types/api.ts`** 에 타입 있는지 확인 (없으면 추가 — 백엔드 스키마 1:1)
- [ ] **`mocks/handlers/<domain>.ts`** 가 백엔드 스키마와 일치하는지 확인 (다르면 정렬 — `as-we-go` 원칙)
- [ ] **`lib/queries/<domain>.ts`** 에서 queryKey 팩토리 + hook 패턴 따르는지
- [ ] **Toss 규칙** 적용: named constants / SRP / consistent return / composition / named conditions
- [ ] **백엔드 미구현 기능** 은 `<ComingSoonSection />` 또는 disabled UI 로 명시
- [ ] **인증 필요 endpoint** 는 `useAuthStore` 의 `accessToken` 을 `apiFetch({ authToken })` 로 전달, `enabled: !!accessToken`

## 📜 컨벤션 한 줄 요약

- **언어**: 코드는 영어 식별자 / 주석·문서·커밋·UI 는 한국어
- **PR 베이스**: `dev` (절대 `main` 으로 PR 만들지 말 것)
- **커밋 타입**: `feat · fix · docs · style · refactor · perf · test · chore · ci · revert · build`
- **커밋 subject**: 전부 lowercase (대문자 토큰 금지: `PR ❌` → `pr ✅`)
- **브랜치명**: `feature/* chore/* refactor/* ci/* docs/*` — 머지 후 자동 삭제
- **PR 본문**: `.github/PULL_REQUEST_TEMPLATE.md` 따름. 백엔드 팀에 공유할 요청은 PR 본문에 정리

## 🆘 막혔을 때

| 증상 | 조치 |
|---|---|
| dev 서버 `Module not found` (방금 install 했는데도) | `pkill -f "next dev" && rm -rf .next && npm run dev` |
| Vercel preview "Too many requests" 403 | Hobby 일일 5000 한도 초과. 24h 후 자동 리셋. 머지는 가능 |
| CodeRabbit "Review skipped (path filters)" | 해당 경로가 `.coderabbit.yaml` 의 path_filters include 에 빠진 것. 필요 시 include 추가 |
| Login 후 `localhost:3000` 으로 돌아오는데 변화 없음 | 정상 동작 (헤더에 로그인 상태 UI 가 아직 없음). DevTools → Application → localStorage `auth-store` 확인 |
| `docker compose up` 에서 `MYSQL_ROOT_PASSWORD missing` | `.env` 에 추가 (`MYSQL_ROOT_PASSWORD=root1234`) — BE 가 안 줘서 누락 가능 

## 📡 백엔드 팀과의 약속

- BE 배포: 로컬 only (`http://localhost:8080`). 공개 URL 없음 → Vercel 배포본에서 OAuth 안 됨
- OAuth: Google only. 흐름 = `/oauth2/authorization/google` → callback → `/auth/callback#accessToken=`
- 인증: Bearer JWT. 갱신 `POST /api/auth/refresh`, 로그아웃 `POST /api/auth/logout`
- 백엔드 Docker 이미지: `kwondh1126/ecommerce-be:latest` (Docker Hub)

## 운영 메모

상세 운영 메모는 `phase-0-to-4-setup.md` / `phase-5-progress.md` 의 "운영 메모" 섹션.

## vercel

vercel 배포는 되어있지만, 로컬로 실행하는 것을 적극 권장. 도커도 실행해야 한다.
