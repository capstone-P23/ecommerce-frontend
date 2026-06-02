'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * MSW 활성화 조건
 *  - dev: 항상 on
 *  - preview/production: NEXT_PUBLIC_API_MOCKING=enabled 일 때만 on
 *
 * Vercel preview 에서 mock 데이터로 데모하려면
 * Project → Settings → Environment Variables 에 위 키를 추가.
 * 06/01~02 isMockingEnabled = false 처리
 */
const isMockingEnabled = false;

/**
 * 글로벌 클라이언트 프로바이더.
 *
 * - TanStack Query: 모든 서버 상태 / API 호출의 캐싱 레이어
 * - MSW: dev 환경 (또는 명시적 opt-in) 에서 fetch 를 가로채 mock 응답
 */
export function Providers({ children }: { children: ReactNode }) {
  // mocking 비활성 환경은 즉시 ready, 활성 환경은 worker.start() 후 ready
  const [mswReady, setMswReady] = useState(!isMockingEnabled);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    if (!isMockingEnabled || mswReady) return;

    let cancelled = false;
    import('@/mocks/browser')
      .then(({ worker }) =>
        worker.start({ onUnhandledRequest: 'bypass' }),
      )
      .then(() => {
        if (!cancelled) setMswReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mswReady]);

  // mock 환경에서 worker 준비 전에는 useQuery 가 실제 fetch 로 새어나가는 것을
  // 막기 위해 children 렌더 보류. (production 은 즉시 통과)
  if (!mswReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
