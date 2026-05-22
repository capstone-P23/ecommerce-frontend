import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-7xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg">페이지를 찾을 수 없습니다</p>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
        홈으로
      </Link>
    </div>
  );
}
