'use client';

import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { useAuthStore } from '@/lib/auth/store';
import type { AiChatRequest, AiChatResponse } from '@/types/api';

// AI 채팅 queryKey
export const aiKeys = {
  all: ['ai'] as const,
  session: (sessionId: string) =>
    [...aiKeys.all, 'session', sessionId] as const,
};

/**
 * AI 채팅 mutation.
 *
 * 프론트 → Next.js API route (/api/ai/chat) → OpenAI.
 * Spring 백엔드를 거치지 않으므로 apiFetch 대신 직접 fetch 사용.
 * MSW 가 가로채지 않도록 절대 경로(/api/ai/chat) 사용.
 */
export function useAiChat(): UseMutationResult<
  AiChatResponse,
  Error,
  AiChatRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: async (input) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `AI 요청 실패 (${res.status})`);
      }

      return res.json() as Promise<AiChatResponse>;
    },
  });
}
