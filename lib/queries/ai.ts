'use client';

import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { useAuthStore } from '@/lib/auth/store';
import type {
  AiChatEnvelopeResponse,
  AiChatRequest,
  AiChatResponse,
} from '@/types/api';

// AI 채팅 queryKey
export const aiKeys = {
  all: ['ai'] as const,
  session: (sessionId: string) =>
    [...aiKeys.all, 'session', sessionId] as const,
};

/**
 * AI 채팅 mutation.
 *
 * 프론트 → Next.js rewrite (/api/ai/chat) → Spring 백엔드 → FastAPI → OpenAI.
 *
 * apiFetch 는 API_BASE_URL(localhost:8080) 을 직접 붙여 CORS 에러 발생하므로
 * 상대 경로 fetch 를 사용해 Next.js rewrite 프록시를 거치도록 함.
 * 백엔드 응답은 { status, message, data } envelope 이라 data 를 unwrap.
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
        let message = res.statusText;
        try {
          const text = await res.text();
          if (text) message = text;
        } catch {
          // ignore parse errors
        }
        throw new Error(message || `AI 요청 실패 (${res.status})`);
      }

      const envelope = (await res.json()) as AiChatEnvelopeResponse;
      return envelope.data;
    },
  });
}
