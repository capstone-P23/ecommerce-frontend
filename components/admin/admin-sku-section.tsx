'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
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
import {
  useAddSku,
  useDecreaseStock,
  useIncreaseStock,
  useRemoveSku,
} from '@/lib/queries/admin';
import type { Sku } from '@/types/api';

const DEFAULT_ADJUST_QTY = 1;

type Props = {
  productId: number;
  skus: Sku[];
};

export function AdminSkuSection({ productId, skus }: Props) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold">SKU 관리</h2>
          <AddSkuDialog productId={productId} />
        </header>

        {skus.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            등록된 SKU 가 없습니다. 신규 추가하세요.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {skus.map((sku) => (
              <SkuRow key={sku.skuId} productId={productId} sku={sku} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SkuRow({ productId, sku }: { productId: number; sku: Sku }) {
  const increase = useIncreaseStock();
  const decrease = useDecreaseStock();
  const remove = useRemoveSku();

  const handleAdjust = (delta: number) => {
    const mutation = delta > 0 ? increase : decrease;
    mutation.mutate(
      { productId, skuId: sku.skuId, quantity: Math.abs(delta) },
      {
        onSuccess: (res) =>
          toast.success(`재고 변경 — 현재 ${res.currentStock}`),
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  const handleRemove = () => {
    remove.mutate(
      { productId, skuId: sku.skuId },
      {
        onSuccess: () => toast.success('SKU 가 삭제되었습니다.'),
        onError: (e) => toast.error(`삭제 실패: ${e.message}`),
      },
    );
  };

  const optionsText = sku.options.map((o) => `${o.name}:${o.value}`).join(', ');
  const isBusy = increase.isPending || decrease.isPending || remove.isPending;

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="space-y-0.5">
        <p className="font-mono text-xs">{sku.skuCode}</p>
        <p className="text-xs text-muted-foreground">
          {optionsText || '기본'} · 재고 {sku.stock}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handleAdjust(-DEFAULT_ADJUST_QTY)}
          disabled={isBusy || sku.stock === 0}
          aria-label="재고 감소"
        >
          <Minus className="size-3" />
        </Button>
        <span className="min-w-8 text-center text-sm tabular-nums">{sku.stock}</span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handleAdjust(DEFAULT_ADJUST_QTY)}
          disabled={isBusy}
          aria-label="재고 증가"
        >
          <Plus className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRemove}
          disabled={isBusy}
          aria-label="SKU 삭제"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </li>
  );
}

function AddSkuDialog({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('크기');
  const [value, setValue] = useState('');
  const [initialStock, setInitialStock] = useState(10);
  const addMutation = useAddSku();

  const canSubmit =
    value.trim().length > 0 && initialStock >= 0 && !addMutation.isPending;

  const handleSubmit = () => {
    addMutation.mutate(
      {
        productId,
        options: [{ name, value }],
        initialStock,
      },
      {
        onSuccess: () => {
          toast.success('SKU 추가됨');
          setOpen(false);
          setValue('');
        },
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="size-4" />SKU 추가
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SKU 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>옵션 이름 (예: 크기, 색상)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Label>옵션 값 (예: M, RED)</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
          <Label>초기 재고</Label>
          <Input
            type="number"
            min={0}
            value={initialStock}
            onChange={(e) => setInitialStock(Number(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
