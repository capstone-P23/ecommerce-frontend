import type { ReactNode } from 'react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  title: string;
  children: ReactNode;
};

/**
 * (auth) 그룹 페이지의 공통 wrapper.
 * 화면 중앙 정렬 + 로고 + 카드 컨테이너.
 */
export function AuthShell({ title, children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold">
            AI 이커머스 플랫폼
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
