'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useDiscontinueProduct } from '@/lib/queries/admin';
import { useProductList } from '@/lib/queries/products';
import type { ProductSummary } from '@/types/api';

import { AdminProductCreateDialog } from './admin-product-create-dialog';

const PAGE_SIZE = 50;

export function AdminProductsView() {
  const { data, isLoading } = useProductList({ page: 0, size: PAGE_SIZE });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const items = data?.content ?? [];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <AdminProductCreateDialog />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">상품명</th>
                  <th className="px-4 py-2.5">카테고리</th>
                  <th className="px-4 py-2.5">가격</th>
                  <th className="px-4 py-2.5">재고</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductRow({ product }: { product: ProductSummary }) {
  const discontinue = useDiscontinueProduct();
  const [open, setOpen] = useState(false);

  const handleDiscontinue = () => {
    discontinue.mutate(product.id, {
      onSuccess: () => {
        toast.success('단종 처리되었습니다.');
        setOpen(false);
      },
      onError: (e) => toast.error(`실패: ${e.message}`),
    });
  };

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 font-mono text-xs">{product.id}</td>
      <td className="px-4 py-3">{product.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{product.categoryName}</td>
      <td className="px-4 py-3">{formatPrice(product.price, product.currency)}</td>
      <td className="px-4 py-3">{product.totalStock}</td>
      <td className="px-4 py-3 text-xs">{product.status}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="text-xs underline text-muted-foreground"
          >
            상세
          </Link>
          {product.status !== 'DISCONTINUED' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={<Button variant="ghost" size="sm" />}
              >
                단종
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>단종 처리</DialogTitle>
                  <DialogDescription>
                    {product.name} 을 단종으로 표시합니다. 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleDiscontinue}
                    disabled={discontinue.isPending}
                  >
                    단종 확정
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </td>
    </tr>
  );
}
