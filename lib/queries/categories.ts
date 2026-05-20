'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import type { Category } from '@/types/api';

/**
 * 카테고리 도메인 — GET /api/categories → Category[]
 */

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

// 카테고리는 거의 안 변하므로 길게 캐시
const CATEGORIES_STALE_TIME_MS = 1000 * 60 * 30; // 30분

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => apiFetch<Category[]>('/api/categories'),
    staleTime: CATEGORIES_STALE_TIME_MS,
  });
}
