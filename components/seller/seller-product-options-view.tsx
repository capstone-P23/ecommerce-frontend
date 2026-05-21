'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  useAddProductOption,
  useSellerProductOptions,
} from '@/lib/queries/seller-mock';
import { formatPrice } from '@/lib/format';

import { MockNotice } from './mock-notice';

type Props = {
  productId: number;
};

export function SellerProductOptionsView({ productId }: Props) {
  const optionsQuery = useSellerProductOptions(productId);
  const addMutation = useAddProductOption();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stock, setStock] = useState(0);
  const [priceDelta, setPriceDelta] = useState(0);

  if (optionsQuery.isLoading) return <Skeleton className="h-64 w-full" />;
  const options = optionsQuery.data ?? [];

  const canSubmit =
    name.trim().length > 0 && value.trim().length > 0 && stock >= 0 && !addMutation.isPending;

  const handleAdd = () => {
    addMutation.mutate(
      { productId, name, value, stock, priceDelta },
      {
        onSuccess: () => {
          toast.success('옵션이 추가되었습니다.');
          setOpen(false);
          setName('');
          setValue('');
          setStock(0);
          setPriceDelta(0);
        },
        onError: (e) => toast.error(`추가 실패: ${e.message}`),
      },
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 옵션 — #{productId}</h1>
          <MockNotice />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />옵션 추가
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>옵션 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>이름 (예: 크기, 색상)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Label>값 (예: M, Red)</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
              <Label>재고</Label>
              <Input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
              <Label>가격 차이 (원)</Label>
              <Input
                type="number"
                value={priceDelta}
                onChange={(e) => setPriceDelta(Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={!canSubmit}>
                추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">이름</th>
                  <th className="px-4 py-2.5">값</th>
                  <th className="px-4 py-2.5">재고</th>
                  <th className="px-4 py-2.5">가격 차이</th>
                </tr>
              </thead>
              <tbody>
                {options.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      등록된 옵션이 없습니다.
                    </td>
                  </tr>
                ) : (
                  options.map((o) => (
                    <tr key={o.optionId} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs">{o.optionId}</td>
                      <td className="px-4 py-3">{o.name}</td>
                      <td className="px-4 py-3">{o.value}</td>
                      <td className="px-4 py-3">{o.stock}</td>
                      <td className="px-4 py-3">
                        {o.priceDelta === 0 ? '-' : `${o.priceDelta > 0 ? '+' : ''}${formatPrice(o.priceDelta, 'KRW')}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
