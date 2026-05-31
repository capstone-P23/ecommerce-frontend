'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import type {
  PageResponse,
  QuestionCreateRequest,
  QuestionResponse,
} from '@/types/api';

export const DEFAULT_QNA_PAGE_SIZE = 10;

type ProductQuestionParams = {
  page?: number;
  size?: number;
};

// 상품 Q&A queryKey
export const qnaKeys = {
  all: ['qna'] as const,
  byProduct: (productId: string | number) =>
    [...qnaKeys.all, 'product', String(productId)] as const,
  productList: (productId: string | number, params: ProductQuestionParams) =>
    [...qnaKeys.byProduct(productId), 'list', params] as const,
};

export function useProductQuestions(
  productId: number,
  params: ProductQuestionParams = {},
): UseQueryResult<PageResponse<QuestionResponse>> {
  const search = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? DEFAULT_QNA_PAGE_SIZE),
  }).toString();

  return useQuery({
    queryKey: qnaKeys.productList(productId, params),
    queryFn: () =>
      apiFetch<PageResponse<QuestionResponse>>(
        `/api/products/${productId}/questions?${search}`,
      ),
    enabled: Number.isFinite(productId) && productId > 0,
  });
}

type CreateQuestionArgs = {
  productId: number;
} & QuestionCreateRequest;

export function useCreateQuestion(): UseMutationResult<
  QuestionResponse,
  Error,
  CreateQuestionArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, ...body }) =>
      apiFetch<QuestionResponse>(`/api/products/${productId}/questions`, {
        method: 'POST',
        body,
        authToken: accessToken,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: qnaKeys.byProduct(vars.productId),
      });
    },
  });
}

type DeleteQuestionArgs = {
  questionId: number;
  productId: number;
};

export function useDeleteQuestion(): UseMutationResult<
  void,
  Error,
  DeleteQuestionArgs
> {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId }) =>
      apiFetch<void>(`/api/questions/${questionId}`, {
        method: 'DELETE',
        authToken: accessToken,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: qnaKeys.byProduct(vars.productId),
      });
    },
  });
}
