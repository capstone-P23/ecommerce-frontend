import { http, HttpResponse } from 'msw';

import { mockUsers } from '../fixtures/users';

// [MEM-001, MEM-002] 인증
export const authHandlers = [
  // POST /api/members/login
  http.post('/api/members/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    const user = mockUsers.find((u) => u.email === body.email) ?? mockUsers[0];
    return HttpResponse.json({ data: { user, token: 'mock-jwt-token' } });
  }),

  // POST /api/members/signup
  http.post('/api/members/signup', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
    };
    return HttpResponse.json(
      {
        data: {
          user: {
            id: Date.now(),
            email: body.email ?? 'new@user.com',
            name: body.name ?? '신규 사용자',
            role: 'consumer',
            points: 0,
            coupons: 0,
          },
        },
      },
      { status: 201 },
    );
  }),

  // POST /api/members/social-login
  http.post('/api/members/social-login', () => {
    return HttpResponse.json({
      data: { user: mockUsers[0], token: 'mock-social-jwt-token' },
    });
  }),
];
