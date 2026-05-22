'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/lib/queries/categories';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/lib/queries/admin';
import {
  type CategoryFormValues,
  categoryCreateSchema,
} from '@/lib/schemas/admin';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/api';

export function AdminCategoriesView() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = categories ?? [];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">카테고리</h1>
        <CategoryFormDialog mode="create" />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">이름</th>
                  <th className="px-4 py-2.5">slug</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <CategoryFormDialog mode="edit" category={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type DialogProps =
  | { mode: 'create' }
  | { mode: 'edit'; category: Category };

function CategoryFormDialog(props: DialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEdit = props.mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryCreateSchema),
    mode: 'onBlur',
    defaultValues: isEdit
      ? { name: props.category.name, slug: props.category.slug }
      : { name: '', slug: '' },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: CategoryFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: props.category.id, ...values },
        {
          onSuccess: () => {
            toast.success('카테고리가 수정되었습니다.');
            setOpen(false);
          },
          onError: (e) => toast.error(`실패: ${e.message}`),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success('카테고리가 추가되었습니다.');
          reset();
          setOpen(false);
        },
        onError: (e) => toast.error(`실패: ${e.message}`),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button size="sm" variant="ghost" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {isEdit ? '수정' : '카테고리 추가'}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? '카테고리 수정' : '카테고리 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className={cn(errors.name && 'text-destructive')}>이름</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={cn(errors.slug && 'text-destructive')}>
              slug <span className="text-xs text-muted-foreground">(영문/숫자/하이픈)</span>
            </Label>
            <Input {...register('slug')} placeholder="food" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEdit ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
