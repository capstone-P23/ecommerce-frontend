'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
  useAnswerInquiry,
  useSellerInquiries,
} from '@/lib/queries/seller-mock';
import type { SellerInquiry } from '@/types/api';

import { MockNotice } from './mock-notice';

const STATUS_LABEL: Record<SellerInquiry['status'], string> = {
  OPEN: '미답변',
  IN_PROGRESS: '진행중',
  CLOSED: '완료',
};

const STATUS_VARIANT: Record<
  SellerInquiry['status'],
  'default' | 'secondary' | 'destructive'
> = {
  OPEN: 'default',
  IN_PROGRESS: 'default',
  CLOSED: 'secondary',
};

export function SellerCsView() {
  const { data, isLoading } = useSellerInquiries();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = data ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">고객 문의</h1>
        <MockNotice />
      </header>

      <div className="space-y-3">
        {list.map((inquiry) => (
          <InquiryCard key={inquiry.inquiryId} inquiry={inquiry} />
        ))}
      </div>
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: SellerInquiry }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const answerMutation = useAnswerInquiry();

  const handleSubmit = () => {
    answerMutation.mutate(
      { inquiryId: inquiry.inquiryId, answer },
      {
        onSuccess: () => {
          toast.success('답변이 등록되었습니다.');
          setOpen(false);
          setAnswer('');
        },
        onError: (e) => toast.error(`등록 실패: ${e.message}`),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{inquiry.subject}</p>
              <Badge variant={STATUS_VARIANT[inquiry.status]}>
                {STATUS_LABEL[inquiry.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {inquiry.customerName} · {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          {inquiry.status !== 'CLOSED' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button size="sm" variant="outline" />}>
                답변
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>답변 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{inquiry.body}</p>
                  <Label>답변</Label>
                  <Input value={answer} onChange={(e) => setAnswer(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSubmit}
                    disabled={answer.trim().length === 0 || answerMutation.isPending}
                  >
                    등록
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-sm">{inquiry.body}</p>
        {inquiry.answer && (
          <div className="rounded-md bg-muted/30 p-2 text-sm">
            <p className="text-xs font-medium text-muted-foreground">답변</p>
            <p>{inquiry.answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
