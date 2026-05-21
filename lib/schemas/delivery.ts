import { z } from 'zod';

import type { DeliveryInfo } from '@/types/api';

/**
 * DeliveryInfoRequest (api-docs.json) 의 zod 스키마.
 * 필수: receiverName / receiverPhone / zipCode / addressLine1
 */
export const deliverySchema = z.object({
  receiverName: z.string().min(1, '받는 분 이름을 입력해주세요.'),
  receiverPhone: z
    .string()
    .min(1, '연락처를 입력해주세요.')
    .regex(/^[0-9-]+$/, '숫자와 - 만 입력 가능합니다.'),
  zipCode: z.string().min(1, '우편번호를 입력해주세요.'),
  addressLine1: z.string().min(1, '기본 주소를 입력해주세요.'),
  addressLine2: z.string().optional(),
  memo: z.string().max(200, '배송 메모는 200자 이내').optional(),
});

export type DeliveryFormValues = z.infer<typeof deliverySchema>;

// runtime 보장은 zod 가, 타입은 백엔드 DeliveryInfo 와 일치해야 함
// (컴파일 시점 type-level guard)
const _check: DeliveryFormValues extends DeliveryInfo ? true : false = true;
void _check;
