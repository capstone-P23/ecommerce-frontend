'use client';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api/client';

/**
 * Google OAuth 로그인 진입 버튼.
 *
 * 동작:
 *   1. 클릭 → 백엔드의 OAuth 시작 URL 로 full reload
 *   2. 백엔드 → Google 동의 화면 → 백엔드 콜백
 *   3. 백엔드가 /auth/callback#accessToken=... 으로 redirect
 *   4. /auth/callback 페이지가 hash 파싱 → store 저장 → 홈 이동
 *
 * Note: Next.js Link 가 아니라 native <a>. SPA 내 라우팅이 아닌
 *       백엔드 도메인으로 full navigation 이 필요함.
 */
export function GoogleLoginButton() {
  const oauthUrl = `${API_BASE_URL}/oauth2/authorization/google`;

  return (
    <a
      href={oauthUrl}
      className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
    >
      Google 계정으로 계속
    </a>
  );
}
