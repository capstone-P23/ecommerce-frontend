import { z } from 'zod';

import type { CreatePurchaseOrderRequest } from '@/types/api';

/**
 * CreatePurchaseOrderRequest (api-docs.json) 의 zod 스키마.
 */
export const purchaseOrderSchema = z.object({
  // 폼에서는 register('skuId', { valueAsNumber: true }) 로 number 변환 후 전달
  skuId: z.number().int().positive('SKU ID 는 양수여야 합니다.'),
  quantity: z.number().int().min(1, '수량은 1 이상이어야 합니다.'),
  supplierName: z.string().min(1, '공급사명을 입력해주세요.'),
  supplierContact: z.string().optional(),
  expectedAt: z
    .string()
    .min(1, '입고 예정일을 선택해주세요.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.'),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const _check: PurchaseOrderFormValues extends CreatePurchaseOrderRequest ? true : false = true;
void _check;
