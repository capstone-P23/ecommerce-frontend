# Docker 로컬 개발 환경

백엔드와 MySQL 을 Docker 컨테이너로 띄우고, 프론트엔드는 호스트에서 `npm run dev` 로 실행하는 구성.

```text
docker-compose
├─ mysql:3306      → ecommerce-mysql
└─ app:8080        → ecommerce-backend  (kwondh1126/ecommerce-be)

호스트
└─ npm run dev:3000  → Next.js dev 서버 (frontend)
```

## 최초 셋업

```bash
# 1. .env 파일 생성 후 BE 팀이 공유한 dev 값을 채운다
cp .env.example .env
# (에디터로 열어 빈 값 채우기 — 실값은 .env 에만, .env.example 에 절대 X)

# 2. Docker Desktop 실행 (mac/windows) 또는 docker daemon 기동 (linux)
docker info  # 정상이면 Server / Client 정보 출력
```

## 일상 워크플로

```bash
# BE + DB 백그라운드 실행
docker compose up -d

# 상태 확인 (mysql 이 healthy 가 되면 app 이 자동 시작)
docker compose ps

# BE 로그 따라가기
docker compose logs -f app

# 프론트엔드는 별도 터미널에서
npm run dev

# 종료
docker compose down            # 컨테이너 종료 / 데이터 보존
docker compose down -v         # 볼륨까지 삭제 (DB 완전 초기화)
```

## 동작 검증

```bash
# BE OAuth 진입점이 살아있는지 — 정상이면 302 redirect (Location: accounts.google.com/...)
curl -I http://localhost:8080/oauth2/authorization/google
```

브라우저:
1. `http://localhost:3000/login` → Google 버튼 클릭
2. 외부 Google 동의 → BE callback
3. `/auth/callback#accessToken=...` 자동 처리 → 홈 이동

## 트러블슈팅

### 포트 충돌 (3306 / 8080)

```bash
lsof -iTCP:3306 -sTCP:LISTEN
lsof -iTCP:8080 -sTCP:LISTEN
# 점유 프로세스 종료, 또는 docker-compose.yml 의 ports 매핑 변경
```

### BE 가 mysql 에 연결 못 함

```bash
docker compose logs app    # 'Connection refused' / 인증 실패 등 확인
docker compose logs mysql  # 8.0 부팅 자체 에러 확인
docker compose ps          # mysql 의 STATUS 가 (healthy) 여야 app 시작
```

mysql 초기 부팅이 20~40초 걸릴 수 있음. healthcheck 가 통과해야 app 컨테이너가 기동된다.

### 이미지 갱신 (BE 팀이 새 버전 푸시한 경우)

```bash
docker compose pull
docker compose up -d
```

### DB 스키마가 꼬였을 때

```bash
docker compose down -v     # 볼륨 삭제
docker compose up -d       # mysql 새로 초기화
```

### .env 를 수정했는데 반영 안 됨

compose 는 컨테이너 시작 시점의 env 만 사용:

```bash
docker compose down
docker compose up -d
```

### `:?` 변수 누락 에러

`.env` 에 필수 값을 안 채우면 compose 가 실행 자체를 거절한다. 에러 메시지의 키 이름을 `.env` 에 채우면 해결.

## 참고

- `.env` 는 git 추적 대상이 아님 (이미 `.gitignore`)
- 컨테이너 내부에서 BE 가 DB 에 접근할 때는 호스트가 `mysql` (compose 서비스명). `localhost` 는 컨테이너 자기 자신을 가리키므로 동작하지 않음
- 호스트 머신에서 직접 DB 에 접속하고 싶을 때는 `localhost:3306` (compose 가 매핑)
