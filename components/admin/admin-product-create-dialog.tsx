'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/lib/queries/categories';
import { useCreateProduct } from '@/lib/queries/admin';
import {
  type ProductCreateFormValues,
  productCreateSchema,
} from '@/lib/schemas/admin';
import { cn } from '@/lib/utils';

const FORM_ID = 'admin-product-create-form';
const DEFAULT_CURRENCY = 'KRW';

export function AdminProductCreateDialog() {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      price: 0,
      currency: DEFAULT_CURRENCY,
      description: '',
      mainImageUrl: '',
      categoryId: categories?.[0]?.id ?? 1,
    },
  });

  const onSubmit = (values: ProductCreateFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('상품이 생성되었습니다.');
        reset();
        setOpen(false);
      },
      onError: (e) => toast.error(`생성 실패: ${e.message}`),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />신규 상품
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신규 상품</DialogTitle>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="상품명" error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="가격" error={errors.price?.message}>
            <Input
              type="number"
              min={0}
              {...register('price', { valueAsNumber: true })}
            />
          </Field>
          <Field label="통화 (3자, 예: KRW)" error={errors.currency?.message}>
            <Input {...register('currency')} />
          </Field>
          <Field label="대표 이미지 URL" error={errors.mainImageUrl?.message}>
            <Input {...register('mainImageUrl')} placeholder="https://..." />
          </Field>
          <Field label="설명" error={errors.description?.message}>
            <Input {...register('description')} />
          </Field>
          <Field label="카테고리" error={errors.categoryId?.message}>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </form>
        <DialogFooter>
          <Button type="submit" form={FORM_ID} disabled={createMutation.isPending}>
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
