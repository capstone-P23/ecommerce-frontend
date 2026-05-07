// 브라우저 환경의 MSW worker.
// app/providers.tsx 에서 dev 환경에 한해 dynamic import.
import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
