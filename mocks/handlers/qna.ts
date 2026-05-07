import { http, HttpResponse } from 'msw';

// [QNA-001] 상품 Q&A
export const qnaHandlers = [
  // GET /api/products/{productId}/qna
  http.get('/api/products/:productId/qna', ({ params }) => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          productId: Number(params.productId),
          question: '배송은 얼마나 걸리나요?',
          answer: '평균 1~2일 내 출고됩니다.',
          createdAt: '2026-04-20T10:00:00Z',
        },
        {
          id: 2,
          productId: Number(params.productId),
          question: '재고가 있나요?',
          answer: null,
          createdAt: '2026-04-29T15:00:00Z',
        },
      ],
    });
  }),

  // POST /api/products/{productId}/qna
  http.post('/api/products/:productId/qna', async ({ params, request }) => {
    const body = (await request.json()) as { question?: string };
    return HttpResponse.json(
      {
        data: {
          id: Date.now(),
          productId: Number(params.productId),
          question: body.question ?? '',
          answer: null,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
];
