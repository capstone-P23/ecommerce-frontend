'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type PurchaseOrderFormValues,
  purchaseOrderSchema,
} from '@/lib/schemas/purchase-order';
import { useCreatePurchaseOrder } from '@/lib/queries/seller';
import { cn } from '@/lib/utils';

type Props = {
  /** 생성 성공 시 콜백 (보통 Dialog close) */
  onCreated?: () => void;
};

const FORM_ID = 'purchase-order-form';

export function PurchaseOrderForm({ onCreated }: Props) {
  const createMutation = useCreatePurchaseOrder();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    mode: 'onBlur',
    defaultValues: {
      skuId: 101,
      quantity: 10,
      supplierName: '',
      supplierContact: '',
      expectedAt: '',
    },
  });

  const onSubmit = (values: PurchaseOrderFormValues) => {
    createMutation.mutate(values, {
      onSuccess: (ref) => {
        toast.success(`발주 생성 (${ref.purchaseOrderNumber})`);
        reset();
        onCreated?.();
      },
      onError: (e) => toast.error(`발주 실패: ${e.message}`),
    });
  };

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="SKU ID" error={errors.skuId?.message}>
        <Input
          type="number"
          {...register('skuId', { valueAsNumber: true })}
          aria-invalid={!!errors.skuId}
        />
      </Field>
      <Field label="수량" error={errors.quantity?.message}>
        <Input
          type="number"
          min={1}
          {...register('quantity', { valueAsNumber: true })}
          aria-invalid={!!errors.quantity}
        />
      </Field>
      <Field label="공급사명" error={errors.supplierName?.message}>
        <Input {...register('supplierName')} aria-invalid={!!errors.supplierName} />
      </Field>
      <Field label="공급사 연락처 (선택)" error={errors.supplierContact?.message}>
        <Input {...register('supplierContact')} placeholder="010-..." />
      </Field>
      <Field label="입고 예정일" error={errors.expectedAt?.message}>
        <Input type="date" {...register('expectedAt')} aria-invalid={!!errors.expectedAt} />
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" form={FORM_ID} disabled={createMutation.isPending}>
          {createMutation.isPending ? '생성 중...' : '발주 생성'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn('text-sm', error && 'text-destructive')}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
