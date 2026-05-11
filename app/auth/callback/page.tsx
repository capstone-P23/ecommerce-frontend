'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/lib/auth/store';

/**
 * Google OAuth 콜백 처리 페이지.
 *
 * 백엔드 흐름:
 *   /oauth2/authorization/google → Google → 백엔드 콜백
 *   → http://localhost:3000/auth/callback#accessToken=...
 *
 * 여기서 hash 를 파싱해서 토큰을 store 에 저장한 뒤 홈으로 이동.
 *
 * SSR 불가 (window.location.hash 는 클라이언트에서만 접근 가능)
 */
type ParseResult =
  | { status: 'pending' }
  | { status: 'success'; token: string }
  | { status: 'error'; message: string };

function parseHash(): ParseResult {
  if (typeof window === 'undefined') return { status: 'pending' };

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return {
      status: 'error',
      message: '인증 토큰이 전달되지 않았습니다. 다시 로그인해주세요.',
    };
  }

  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get('accessToken');
  if (!accessToken) {
    return { status: 'error', message: 'accessToken 을 찾을 수 없습니다.' };
  }

  return { status: 'success', token: accessToken };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  // useState initializer: mount 시 1회만 실행 → URL hash 파싱
  // setState in effect 패턴 회피를 위해 effect 가 아닌 초기화 시점에 처리
  const [result] = useState<ParseResult>(parseHash);

  useEffect(() => {
    if (result.status !== 'success') return;
    setToken(result.token);
    router.replace('/');
  }, [result, router, setToken]);

  if (result.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <p className="text-sm text-destructive">{result.message}</p>
          <Link href="/login" className="text-sm underline">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">로그인 처리 중…</p>
    </div>
  );
}
