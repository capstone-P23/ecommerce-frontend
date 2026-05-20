'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import { Search, ShoppingCart, User, LogIn } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';

type Props = {
  storeDomain: string;
};

const KEYWORD_FIELD_NAME = 'keyword';

/**
 * 소비자 영역 상단 GNB.
 * - 좌측: 스토어 브랜드
 * - 중앙: 검색바 → submit 시 /consumer/{storeDomain}/products?keyword= 로 이동
 * - 우측: 장바구니 / 마이페이지 / 로그인
 *
 * Note: <a> 를 <button> 안에 넣는 것은 HTML 비표준이라 Button 컴포넌트 대신
 *       buttonVariants 로 Link 에 스타일만 적용합니다.
 */
export function TopNavigation({ storeDomain }: Props) {
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const keyword = String(data.get(KEYWORD_FIELD_NAME) ?? '').trim();
    const base = `/consumer/${storeDomain}/products`;
    router.push(keyword ? `${base}?keyword=${encodeURIComponent(keyword)}` : base);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          href={`/consumer/${storeDomain}`}
          className="text-base font-semibold whitespace-nowrap"
        >
          ecommerce
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-xl"
          role="search"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name={KEYWORD_FIELD_NAME}
            placeholder="상품 검색"
            className="pl-9"
            aria-label="상품 검색"
          />
        </form>

        <nav className="flex items-center gap-1">
          <Link
            href={`/consumer/${storeDomain}/cart`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="장바구니"
          >
            <ShoppingCart className="size-5" />
          </Link>
          <Link
            href={`/consumer/${storeDomain}/mypage/orders`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="마이페이지"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            <LogIn className="size-4" />
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
