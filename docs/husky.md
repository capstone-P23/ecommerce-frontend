# 🧩 Git Commit Convention (Husky + Commitlint)

## ✅ 기본 구조

```bash
type(scope): subject
```

예시:

```bash
feat(auth): add login feature
fix(api): handle null response
chore: update husky config
```

body 부분은 자율입니다.

## 📌 type 사용 기준

### 1. feat

👉 새로운 기능 추가

```bash
# 거의 왠만하면 이 타입을 쓸 가능성이 높습니다.
feat: 회원가입 기능 추가
```

### 2. fix

👉 버그 수정 (의도와 다르게 동작하던 것 해결)

```bash
# 코드 버그에만 적용해주세요. "잘못된 것"을 "고친것"이 fix입니다.
fix: 로그인 버튼 클릭 안되는 문제 수정
```

### 3. docs

👉 문서 관련 변경, 주석 추가 및 변경

```bash
docs: README에 설치 방법 추가
```

### 4. style

👉 코드 스타일 변경 (동작 변화 없음)

```bash
#코드의 "스타일"이 바뀌는 것입니다. ui/ux 스타일링은 feat으로 작성해주세요.
style: 들여쓰기 수정
style: 세미콜론 추가
```

### 5. refactor

👉 리팩토링 (동작 동일, 코드 구조 개선)

```bash
refactor: 로그인 로직 분리
```

### 6. perf

👉 성능 개선

```bash
perf: 렌더링 최적화
```

### 7. test

👉 테스트 코드 추가/수정

```bash
test: 로그인 테스트 추가
```

### 8. chore

👉 설정, 환경, 기타 작업

```bash
chore: husky 설정 추가
chore: package 버전 업데이트
```

### 9. ci

👉 CI/CD 설정 변경

```bash
ci: github actions 설정 추가
```

### 10. build

👉 빌드 관련 변경

```bash
build: vite 설정 수정
```

### 11. revert

👉 이전 커밋 되돌리기

```bash
revert: feat 로그인 기능 롤백
```

## ⚙️ 규칙 설명 (commitlint rules)

### 1. type-case

```js
'type-case': [2, 'always', 'lower-case']
```

👉 type은 항상 소문자만 허용
❌ `Feat`, `FIX`
✅ `feat`, `fix`

### 2. subject-empty

```js
'subject-empty': [2, 'never']
```

👉 subject는 비어있으면 안 됨
❌ `feat:`
✅ `feat: 로그인 기능 추가`

### 3. subject-full-stop

```js
'subject-full-stop': [2, 'never', '.']
```

👉 subject 끝에 마침표 금지
❌ `feat: 로그인 기능 추가.`
✅ `feat: 로그인 기능 추가`

### 4. subject-case

```js
'subject-case': [2, 'always', 'lower-case']
```

👉 subject는 소문자만 허용
❌ `feat: Login Feature`
✅ `feat: login feature`

### 5. scope-case

```js
'scope-case': [2, 'always', 'lower-case']
```

👉 scope도 소문자만 허용
❌ `feat(Auth): login`
✅ `feat(auth): login`

## 💡 추가 규칙

- scope는 선택사항입니다.

```
feat: 로그인 기능 추가
feat(auth): 로그인 기능 추가
```

## 🔥 한 줄 정리

- 기능 → feat
- 버그 → fix
- 구조 개선 → refactor
- 설정 → chore
- 문서 → docs

👉 나머지는 목적 기준으로 선택합니다.
