import { http, HttpResponse } from 'msw';

// [REV-001] 리뷰 작성
export const reviewHandlers = [
  // POST /api/reviews
  http.post('/api/reviews', async ({ request }) => {
    const body = (await request.json()) as {
      productId?: number;
      rating?: number;
      content?: string;
    };
    return HttpResponse.json(
      {
        data: {
          id: Date.now(),
          productId: body.productId,
          rating: body.rating ?? 5,
          content: body.content ?? '',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
];
