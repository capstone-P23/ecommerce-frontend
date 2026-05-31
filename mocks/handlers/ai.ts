import { http, HttpResponse } from 'msw';

// [AI-001] AI 대화형 추천
export const aiHandlers = [
  // POST /api/ai/chat
  http.post('*/api/ai/chat', async ({ request }) => {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };
    return HttpResponse.json({
      sessionId: body.sessionId ?? `session-${Date.now()}`,
      answer:
        'TODO (Phase 8): 실제 LLM 응답 + 추천 상품. ' +
        `에코: "${body.message ?? ''}"`,
      recommendations: [
        {
          productId: 10,
          name: '라이트 바람막이',
          price: 59000,
          imageUrl: 'https://picsum.photos/seed/ai-windbreaker/240/240',
          reason: '생활방수 가능한 아우터로 비 오는 날에 잘 맞습니다.',
        },
      ],
      followUpQuestions: ['예산은 어느 정도인가요?', '선호하는 색상이 있나요?'],
    });
  }),

  // GET /api/ai/chat/{sessionId}
  http.get('*/api/ai/chat/:sessionId', ({ params }) => {
    return HttpResponse.json({
      sessionId: params.sessionId,
      answer: '시원한 콜드브루는 어떠세요? (TODO Phase 8: 실제 응답)',
      recommendations: [],
      followUpQuestions: [],
    });
  }),
];
