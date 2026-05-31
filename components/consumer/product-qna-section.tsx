'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth/store';
import { useCreateQuestion, useProductQuestions } from '@/lib/queries/qna';

const DEFAULT_MESSAGE = '질문을 작성해주세요.';

type Props = {
  productId: number;
};

export function ProductQnaSection({ productId }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isLoading, isError } = useProductQuestions(productId);
  const createQuestion = useCreateQuestion();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = String(formData.get('content') ?? '').trim();
    const secret = Boolean(formData.get('secret'));

    if (!content) return;

    await createQuestion.mutateAsync({ productId, content, secret });
    form.reset();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">상품 Q&A</h2>
        <p className="text-xs text-muted-foreground">
          문의는 로그인 후 등록됩니다.
        </p>
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
          <p className="text-muted-foreground">
            로그인 후 질문을 작성할 수 있어요.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex text-sm font-medium text-primary"
          >
            로그인 하러가기
          </Link>
        </div>
      )}

      {accessToken && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="qna-content">
            질문 내용
          </label>
          <textarea
            id="qna-content"
            name="content"
            rows={3}
            placeholder={DEFAULT_MESSAGE}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              name="secret"
              className="size-4 rounded border border-border"
            />
            비밀글로 등록
          </label>
          <Button type="submit" size="sm" disabled={createQuestion.isPending}>
            {createQuestion.isPending ? '등록 중' : '질문 등록'}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">질문을 불러오지 못했어요.</p>
        )}
        {!isLoading && !isError && data?.content.length === 0 && (
          <p className="text-sm text-muted-foreground">
            아직 등록된 질문이 없습니다.
          </p>
        )}
        {data?.content.map((item) => (
          <div key={item.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{item.memberName}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
            <p className="mt-2 text-sm">{item.content}</p>
            {item.secret && (
              <p className="mt-1 text-xs text-muted-foreground">비밀글</p>
            )}
            {item.answer && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">답변</p>
                <p className="mt-1 text-muted-foreground">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
