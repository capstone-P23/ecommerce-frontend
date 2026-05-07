// 모든 도메인 핸들러를 한 배열로 합쳐 setupWorker / setupServer 에 전달
import { adminHandlers } from './admin';
import { aiHandlers } from './ai';
import { authHandlers } from './auth';
import { memberHandlers } from './members';
import { orderHandlers } from './orders';
import { productHandlers } from './products';
import { qnaHandlers } from './qna';
import { reviewHandlers } from './reviews';
import { sellerHandlers } from './seller';

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...memberHandlers,
  ...reviewHandlers,
  ...qnaHandlers,
  ...aiHandlers,
  ...sellerHandlers,
  ...adminHandlers,
];
