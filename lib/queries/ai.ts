// AI 채팅 queryKey
export const aiKeys = {
  all: ['ai'] as const,
  session: (sessionId: string) => [...aiKeys.all, 'session', sessionId] as const,
};
