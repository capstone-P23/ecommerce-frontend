'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  type DeliveryFormValues,
  deliverySchema,
} from '@/lib/schemas/delivery';

type Props = {
  /** 외부 submit 트리거: 부모(=CheckoutView) 가 자체 버튼으로 제출하기 위한 form id */
  formId: string;
  onSubmit: (values: DeliveryFormValues) => void;
};

/**
 * 배송 정보 입력 폼.
 * form-level cohesion: 단일 zod 스키마(deliverySchema) 로 전체 검증.
 * 외부 submit 버튼은 form="..." 속성으로 연결 (CheckoutView 의 "결제하기" 버튼).
 */
export function DeliveryForm({ formId, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    mode: 'onBlur',
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      zipCode: '',
      addressLine1: '',
      addressLine2: '',
      memo: '',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        label="받는 분"
        error={errors.receiverName?.message}
        input={
          <Input
            {...register('receiverName')}
            autoComplete="name"
            aria-invalid={!!errors.receiverName}
          />
        }
      />
      <Field
        label="연락처"
        error={errors.receiverPhone?.message}
        input={
          <Input
            {...register('receiverPhone')}
            placeholder="010-1234-5678"
            autoComplete="tel"
            aria-invalid={!!errors.receiverPhone}
          />
        }
      />
      <Field
        label="우편번호"
        error={errors.zipCode?.message}
        input={
          <Input
            {...register('zipCode')}
            placeholder="12345"
            autoComplete="postal-code"
            aria-invalid={!!errors.zipCode}
          />
        }
      />
      <Field
        label="기본 주소"
        error={errors.addressLine1?.message}
        input={
          <Input
            {...register('addressLine1')}
            autoComplete="address-line1"
            aria-invalid={!!errors.addressLine1}
          />
        }
      />
      <Field
        label="상세 주소"
        error={errors.addressLine2?.message}
        input={
          <Input
            {...register('addressLine2')}
            autoComplete="address-line2"
          />
        }
      />
      <Field
        label="배송 메모"
        hint="선택 (예: 부재 시 경비실)"
        error={errors.memo?.message}
        input={<Input {...register('memo')} />}
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// 작은 헬퍼: Label + Input + 에러 메시지 한 묶음
// (premature abstraction 회피 — 이 파일 안에서만 사용)
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  input,
}: {
  label: string;
  hint?: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn('text-sm', error && 'text-destructive')}>
        {label}
        {hint && <span className="ml-1 text-xs text-muted-foreground">— {hint}</span>}
      </Label>
      {input}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
