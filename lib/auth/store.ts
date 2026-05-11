import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Auth 세션 스토어.
 *
 * 전략: Bearer accessToken 을 localStorage 에 보관.
 *   - Google OAuth 콜백 (/auth/callback#accessToken=...) 에서 setToken
 *   - 모든 인증 필요 API 가 useAuthStore 에서 토큰 꺼내 헤더 첨부
 *   - 로그아웃 시 clearToken
 *
 * 보안 노트 (TODO 후속):
 *   localStorage 는 XSS 에 취약. 백엔드가 httpOnly 쿠키로 발급하도록
 *   변경되면 여기 store 는 "로그인 여부" 만 보관하는 marker 로 축소.
 */
type AuthState = {
  accessToken: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setToken: (token) => set({ accessToken: token }),
      clearToken: () => set({ accessToken: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
