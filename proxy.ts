import { NextResponse, type NextRequest } from 'next/server';

// 호스트네임 기반 Route Rewrite (Next.js 16 의 proxy = 구 middleware).

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/consumer')
  ) {
    return NextResponse.next();
  }

  const subdomain = hostname.split('.')[0]?.split(':')[0] ?? '';

  if (subdomain === 'admin') {
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
  }

  if (subdomain === 'seller') {
    return NextResponse.rewrite(new URL(`/seller${pathname}`, request.url));
  }

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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
