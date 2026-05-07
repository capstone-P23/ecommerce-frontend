// Node 환경의 MSW server (Vitest / Jest 등 테스트용).
// 현재 테스트 러너 미도입 상태라 실사용은 후속 phase 에서.
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);
