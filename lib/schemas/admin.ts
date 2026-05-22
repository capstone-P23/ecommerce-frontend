import { z } from 'zod';

import type {
  CategoryCreateRequest,
  ProductCreateRequest,
} from '@/types/api';

/**
 * Admin 입력 zod 스키마. 백엔드 OpenAPI 제약 그대로.
 * form 에서는 valueAsNumber 로 number 변환.
 */

export const productCreateSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.').max(200),
  price: z.number().min(0, '가격은 0 이상이어야 합니다.'),
  currency: z.string().length(3, 'currency 는 3자 (예: KRW)'),
  description: z.string().max(4000),
  mainImageUrl: z.string().max(500),
  categoryId: z.number().int().positive('카테고리를 선택해주세요.'),
});

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

export const categoryCreateSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50),
  slug: z
    .string()
    .min(1, 'slug 를 입력해주세요.')
    .max(100)
    .regex(/^[a-zA-Z0-9-]+$/, '영문/숫자/하이픈만 사용 가능'),
});

export type CategoryFormValues = z.infer<typeof categoryCreateSchema>;

// type-level guard
const _p: ProductCreateFormValues extends ProductCreateRequest ? true : false = true;
const _c: CategoryFormValues extends CategoryCreateRequest ? true : false = true;
void _p;
void _c;
