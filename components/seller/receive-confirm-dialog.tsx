'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReceiveStock } from '@/lib/queries/seller';
import type { PurchaseOrderListItem } from '@/types/api';

type Props = {
  order: PurchaseOrderListItem;
};

/**
 * 발주 행의 "입고 확정" 트리거.
 * dialog 로 받은 수량 확인 후 PATCH /api/seller/stocks/receive 호출.
 */
export function ReceiveConfirmDialog({ order }: Props) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(order.quantity);
  const receiveMutation = useReceiveStock();

  const handleConfirm = () => {
    receiveMutation.mutate(
      { purchaseOrderId: order.purchaseOrderId, receivedQuantity: quantity },
      {
        onSuccess: (res) => {
          toast.success(`입고 완료 — 현재 재고 ${res.currentStock}`);
          setOpen(false);
        },
        onError: (e) => toast.error(`입고 실패: ${e.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>입고 확정</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>입고 확정 — {order.purchaseOrderNumber}</DialogTitle>
          <DialogDescription>
            받은 수량을 확인하고 확정하세요. 발주 수량과 다를 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>받은 수량</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            발주 수량: {order.quantity}개 · 공급사: {order.supplierName}
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={receiveMutation.isPending || quantity < 1}
          >
            확정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
