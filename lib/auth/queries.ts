import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';

import { useAuthStore } from './store';

/**
 * api-docs.json (OpenAPI) 의 MemberResponse 와 일치
 */
export type Member = {
  id: number;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
  locale?: string;
  joinedAt: string;
};

export const meQueryKey = ['auth', 'me'] as const;

/**
 * 현재 로그인한 사용자 정보. 토큰 없으면 disabled.
 * GET /api/members/me
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<Member>({
    queryKey: meQueryKey,
    queryFn: () =>
      apiFetch<Member>('/api/members/me', { authToken: accessToken }),
    enabled: !!accessToken,
    staleTime: 5 * 60_000, // 5분 — 사용자 정보는 자주 바뀌지 않음
  });
}

/**
 * 로그아웃 — 백엔드 세션 종료 + 로컬 토큰 제거 + 쿼리 캐시 비움.
 * POST /api/auth/logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearToken = useAuthStore((s) => s.clearToken);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/auth/logout', {
        method: 'POST',
        authToken: accessToken,
      }),
    // 백엔드 응답과 무관하게 로컬 토큰 / 캐시 정리
    onSettled: () => {
      clearToken();
      queryClient.clear();
    },
  });
}
