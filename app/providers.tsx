'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * 글로벌 클라이언트 프로바이더.
 *
 * - TanStack Query: 모든 서버 상태 / API 호출의 캐싱 레이어
 * - MSW 부트스트랩은 Phase 3 (mocks 트리 구성) 에서 추가 예정
 */
export function Providers({ children }: { children: ReactNode }) {
  // SSR 직렬화 안전: 컴포넌트 인스턴스마다 단일 client 유지
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
