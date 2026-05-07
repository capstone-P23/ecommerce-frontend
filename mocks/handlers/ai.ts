import { http, HttpResponse } from 'msw';

// [AI-001] AI 대화형 추천
export const aiHandlers = [
  // POST /api/ai/chat
  http.post('/api/ai/chat', async ({ request }) => {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };
    return HttpResponse.json({
      data: {
        sessionId: body.sessionId ?? `session-${Date.now()}`,
        reply:
          'TODO (Phase 8): 실제 LLM 응답 + 추천 상품. ' +
          `에코: "${body.message ?? ''}"`,
        recommendations: [],
      },
    });
  }),

  // GET /api/ai/chat/{sessionId}
  http.get('/api/ai/chat/:sessionId', ({ params }) => {
    return HttpResponse.json({
      data: {
        sessionId: params.sessionId,
        messages: [
          { role: 'user', content: '여름에 어울리는 음료 추천해줘' },
          {
            role: 'assistant',
            content: '시원한 콜드브루는 어떠세요? (TODO Phase 8: 실제 응답)',
          },
        ],
      },
    });
  }),
];
