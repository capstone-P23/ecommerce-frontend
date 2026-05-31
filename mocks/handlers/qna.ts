import { http, HttpResponse } from 'msw';

import type { PageResponse, QuestionResponse } from '@/types/api';

const seedQuestions: QuestionResponse[] = [
  {
    id: 1,
    productId: 1,
    productName: '기본 상품',
    memberName: '김지수',
    content: '배송은 얼마나 걸리나요?',
    secret: false,
    status: 'ANSWERED',
    answer: '평균 1~2일 내 출고됩니다.',
    answeredAt: '2026-04-20T12:00:00Z',
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 2,
    productId: 1,
    productName: '기본 상품',
    memberName: '박서윤',
    content: '재고가 있나요?',
    secret: false,
    status: 'PENDING',
    createdAt: '2026-04-29T15:00:00Z',
  },
];

let questions = [...seedQuestions];

const buildPage = <T>(
  items: T[],
  page: number,
  size: number,
): PageResponse<T> => {
  const start = page * size;
  const slice = items.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  return {
    content: slice,
    totalElements: items.length,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    numberOfElements: slice.length,
    empty: slice.length === 0,
  };
};

// [QNA-001] 상품 Q&A
export const qnaHandlers = [
  // GET /api/products/{productId}/questions
  http.get('*/api/products/:productId/questions', ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 10);
    const productId = Number(params.productId);
    const filtered = questions.filter((item) => item.productId === productId);
    return HttpResponse.json(buildPage(filtered, page, size));
  }),

  // POST /api/products/{productId}/questions
  http.post(
    '*/api/products/:productId/questions',
    async ({ params, request }) => {
      const body = (await request.json()) as {
        content?: string;
        secret?: boolean;
      };
      if (!body?.content) {
        return HttpResponse.json({ error: 'Invalid request' }, { status: 400 });
      }
      const productId = Number(params.productId);
      const created: QuestionResponse = {
        id: Date.now(),
        productId,
        productName: '기본 상품',
        memberName: '나',
        content: body.content,
        secret: Boolean(body.secret),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      questions = [created, ...questions];
      return HttpResponse.json(created, { status: 201 });
    },
  ),

  // DELETE /api/questions/{questionId}
  http.delete('*/api/questions/:questionId', ({ params }) => {
    const questionId = Number(params.questionId);
    const target = questions.find((item) => item.id === questionId);
    if (!target)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    if (target.status === 'ANSWERED') {
      return HttpResponse.json({ error: 'Answer exists' }, { status: 400 });
    }
    questions = questions.filter((item) => item.id !== questionId);
    return new HttpResponse(null, { status: 204 });
  }),
];
