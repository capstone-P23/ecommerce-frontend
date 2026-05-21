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
import { useAdjustReceive, useCancelReceive } from '@/lib/queries/seller';
import type { ReceiveHistory } from '@/types/api';

type Props = {
  history: ReceiveHistory;
};

/**
 * 입고 이력 행의 액션 묶음 (조정 / 취소).
 * 각각 dialog 안에서 자체 form / confirm 처리.
 */
export function ReceiveRowActions({ history }: Props) {
  return (
    <div className="flex gap-2">
      <AdjustDialog history={history} />
      <CancelDialog history={history} />
    </div>
  );
}

function AdjustDialog({ history }: { history: ReceiveHistory }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(history.receivedQuantity);
  const [reason, setReason] = useState('');
  const adjustMutation = useAdjustReceive();

  const canSubmit = reason.trim().length > 0 && quantity >= 1 && !adjustMutation.isPending;

  const handleSubmit = () => {
    adjustMutation.mutate(
      { historyId: history.stockHistoryId, receivedQuantity: quantity, reason },
      {
        onSuccess: (res) => {
          toast.success(`조정 완료 — 재고 ${res.currentStock}`);
          setOpen(false);
        },
        onError: (e) => toast.error(`조정 실패: ${e.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>조정</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>입고 수량 조정</DialogTitle>
          <DialogDescription>
            기존 {history.receivedQuantity}개 → 새 수량 입력 + 사유 필수.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>새 수량</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <Label>사유</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 검수 후 손상품 제외"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            조정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ history }: { history: ReceiveHistory }) {
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelReceive();

  const handleCancel = () => {
    cancelMutation.mutate(history.stockHistoryId, {
      onSuccess: (res) => {
        toast.success(`취소 완료 — 재고 ${res.currentStock}`);
        setOpen(false);
      },
      onError: (e) => toast.error(`취소 실패: ${e.message}`),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>취소</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>입고를 취소하시겠어요?</DialogTitle>
          <DialogDescription>
            {history.receivedQuantity}개가 재고에서 차감되며, 이력은 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            취소 확정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
