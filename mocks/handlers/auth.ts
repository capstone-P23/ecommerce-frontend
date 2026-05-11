import { http, HttpResponse } from 'msw';

/**
 * 인증 관련 MSW 핸들러 — 백엔드 api-docs.json 기준으로 정렬.
 *
 * 백엔드 실제 endpoint:
 *   POST /api/auth/refresh   - refresh token
 *   POST /api/auth/logout    - logout
 *
 * Google OAuth 자체는 외부 redirect 기반이라 MSW 가 가로챌 수 없음.
 * (브라우저가 backend 의 /oauth2/authorization/google 로 직접 이동)
 *
 * URL 패턴: '*' 로 origin 와일드카드 — 절대(http://localhost:8080/...)
 *           / 상대(/api/...) 모두 매치.
 */
export const authHandlers = [
  // POST */api/auth/refresh
  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json({ accessToken: 'mock-refreshed-jwt-token' });
  }),

  // POST */api/auth/logout
  http.post('*/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
