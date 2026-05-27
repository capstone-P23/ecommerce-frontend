'use client';

import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** 루트 error boundary — 어디서든 throw 된 에러를 잡는다. 도메인별 error.tsx 로 더 좁게 잡고 싶으면 해당 segment 에 별도 파일 추가. */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">앗, 문제가 발생했습니다</h1>
      <p className="max-w-md text-sm text-muted-foreground break-all">
        {error.message || '알 수 없는 오류'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">에러 ID: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => reset()}>다시 시도</Button>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          홈으로
        </Link>
      </div>
    </div>
  );
}
