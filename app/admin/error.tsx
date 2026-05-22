'use client';

import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-bold">관리자 영역에서 오류가 발생했습니다</h1>
      <p className="max-w-md text-sm text-muted-foreground break-all">{error.message}</p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </div>
  );
}
