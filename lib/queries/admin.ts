// 관리자 도메인 queryKey
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  sellers: () => [...adminKeys.all, 'sellers'] as const,
  policy: () => [...adminKeys.all, 'policy'] as const,
  contents: () => [...adminKeys.all, 'contents'] as const,
  logs: () => [...adminKeys.all, 'logs'] as const,
};
