'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
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
import { useUpdateProduct } from '@/lib/queries/admin';
import {
  type ProductCreateFormValues,
  productCreateSchema,
} from '@/lib/schemas/admin';
import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/types/api';

const FORM_ID = 'admin-product-edit-form';

type Props = {
  product: ProductDetail;
};

export function AdminProductEditDialog({ product }: Props) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: product.name,
      price: product.price,
      currency: product.currency,
      description: product.description,
      mainImageUrl: product.mainImageUrl,
      categoryId: product.category.id,
    },
  });

  const onSubmit = (values: ProductCreateFormValues) => {
    updateMutation.mutate(
      { id: product.id, ...values },
      {
        onSuccess: () => {
          toast.success('상품이 수정되었습니다.');
          setOpen(false);
        },
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Pencil className="size-4" />수정
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>상품 수정 — #{product.id}</DialogTitle>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <F label="상품명" error={errors.name?.message}>
            <Input {...register('name')} />
          </F>
          <F label="가격" error={errors.price?.message}>
            <Input
              type="number"
              min={0}
              {...register('price', { valueAsNumber: true })}
            />
          </F>
          <F label="통화" error={errors.currency?.message}>
            <Input {...register('currency')} />
          </F>
          <F label="이미지 URL" error={errors.mainImageUrl?.message}>
            <Input {...register('mainImageUrl')} />
          </F>
          <F label="설명" error={errors.description?.message}>
            <Input {...register('description')} />
          </F>
          <F label="카테고리" error={errors.categoryId?.message}>
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
          </F>
        </form>
        <DialogFooter>
          <Button type="submit" form={FORM_ID} disabled={updateMutation.isPending}>
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({
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
