## proxy

각 코드의 간단한 설명을 내포합니다. (실제 코드에서 주석은 제거합니다.)

```ts
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 호스트네임 기반 Route Rewrite (Next.js 16 의 proxy = 구 middleware).
 *
 * 운영 환경 매핑:
 *   admin.platform.com    → /admin/*
 *   seller.platform.com   → /seller/*
 *   {store}.platform.com  → /consumer/{store}/*
 *
 * 로컬 개발:
 *   - localhost:3000/admin/...  처럼 직접 path 진입 가능 (rewrite 없이 통과)
 *   - 서브도메인 테스트는 /etc/hosts 설정 또는 *.localhost (Chrome/Firefox 지원)
 */
export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // 인증 페이지 / OAuth 콜백은 모든 호스트에서 동일 경로
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  // 이미 역할별 prefix 로 들어온 요청은 그대로 통과
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/consumer')
  ) {
    return NextResponse.next();
  }

  // host 의 첫 segment 가 서브도메인
  const subdomain = hostname.split('.')[0]?.split(':')[0] ?? '';

  if (subdomain === 'admin') {
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
  }

  if (subdomain === 'seller') {
    return NextResponse.rewrite(new URL(`/seller${pathname}`, request.url));
  }

  // 그 외 서브도메인 = 스토어 도메인으로 간주
  // localhost / IP / 루트 도메인 직접 접근은 제외
  const isPlainLocalhost = hostname.startsWith('localhost');
  const isBareDomain = !hostname.includes('.') || hostname.split('.').length < 3;
  if (subdomain && !isPlainLocalhost && !isBareDomain) {
    return NextResponse.rewrite(
      new URL(`/consumer/${subdomain}${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // _next 정적 자원, api, favicon 은 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```
