'use client';

import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import type { AiChatRequest, AiChatResponse } from '@/types/api';

// AI 채팅 queryKey
export const aiKeys = {
  all: ['ai'] as const,
  session: (sessionId: string) =>
    [...aiKeys.all, 'session', sessionId] as const,
};

export function useAiChat(): UseMutationResult<
  AiChatResponse,
  Error,
  AiChatRequest
> {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: (input) =>
      apiFetch<AiChatResponse>('/api/ai/chat', {
        method: 'POST',
        body: input,
        authToken: accessToken,
      }),
  });
}
