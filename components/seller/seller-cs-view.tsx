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
  useAnswerQuestion,
  useDeleteAnswer,
  useSellerQuestions,
  useUpdateAnswer,
} from '@/lib/queries/seller';
import type { QuestionResponse, QuestionStatus } from '@/types/api';

const STATUS_LABEL: Record<QuestionStatus, string> = {
  PENDING: '미답변',
  ANSWERED: '답변완료',
};

const STATUS_VARIANT: Record<
  QuestionStatus,
  'default' | 'secondary' | 'destructive'
> = {
  PENDING: 'default',
  ANSWERED: 'secondary',
};

export function SellerCsView() {
  const { data, isLoading } = useSellerQuestions();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = data?.content ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">상품 Q&A 관리</h1>
      </header>

      <div className="space-y-3">
        {list.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionResponse }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const answerMutation = useAnswerQuestion();
  const updateMutation = useUpdateAnswer();
  const deleteMutation = useDeleteAnswer();

  const handleSubmit = () => {
    const content = answer.trim();
    if (!content) return;
    answerMutation.mutate(
      { questionId: question.id, content },
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

  const handleUpdate = () => {
    const content = answer.trim();
    if (!content) return;
    updateMutation.mutate(
      { questionId: question.id, content },
      {
        onSuccess: () => {
          toast.success('답변이 수정되었습니다.');
          setOpen(false);
          setAnswer('');
        },
        onError: (e) => toast.error(`수정 실패: ${e.message}`),
      },
    );
  };

  const handleDelete = () => {
    if (!confirm('답변을 삭제할까요?')) return;
    deleteMutation.mutate(question.id, {
      onSuccess: () => toast.success('답변이 삭제되었습니다.'),
      onError: (e) => toast.error(`삭제 실패: ${e.message}`),
    });
  };

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{question.productName}</p>
              <Badge variant={STATUS_VARIANT[question.status]}>
                {STATUS_LABEL[question.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {question.memberName} · {new Date(question.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          {question.status === 'PENDING' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button size="sm" variant="outline" />}>
                답변
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>답변 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{question.content}</p>
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
        <p className="text-sm">{question.content}</p>
        {question.answer && (
          <div className="rounded-md bg-muted/30 p-2 text-sm">
            <p className="text-xs font-medium text-muted-foreground">답변</p>
            <p>{question.answer}</p>
            <div className="mt-2 flex gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button size="sm" variant="outline" />}>
                  수정
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>답변 수정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{question.content}</p>
                    <Label>답변</Label>
                    <Input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={question.answer ?? ''}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpdate}
                      disabled={answer.trim().length === 0 || updateMutation.isPending}
                    >
                      수정
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                삭제
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
