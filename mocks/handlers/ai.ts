import { http, passthrough } from 'msw';

// [AI-001] AI 대화형 추천
// Next.js API route (/api/ai/chat) 로 실제 OpenAI 호출을 하므로
// MSW 는 해당 요청을 가로채지 않고 passthrough 한다.
export const aiHandlers = [
  // POST /api/ai/chat — Next.js API route 로 통과
  http.post('*/api/ai/chat', () => {
    return passthrough();
  }),

  // GET /api/ai/chat/{sessionId} — Next.js API route 로 통과
  http.get('*/api/ai/chat/:sessionId', () => {
    return passthrough();
  }),
];
