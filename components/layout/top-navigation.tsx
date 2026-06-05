'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { CartIconWithBadge } from '@/components/consumer/cart-icon-with-badge';
import { UserMenu } from '@/components/layout/user-menu';

type Props = {
  storeDomain: string;
};

const KEYWORD_FIELD_NAME = 'keyword';

export function TopNavigation({ storeDomain }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 이 바뀌면 input 이 remount 되어 defaultValue 가 재적용 (key 패턴)
  const currentKeyword = searchParams.get(KEYWORD_FIELD_NAME) ?? '';

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const keyword = String(data.get(KEYWORD_FIELD_NAME) ?? '').trim();
    const base = `/consumer/${storeDomain}/products`;
    router.push(
      keyword ? `${base}?keyword=${encodeURIComponent(keyword)}` : base,
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <Image
            src="../curling-stone.svg"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-sm"
          />
          <Link
            href={`/consumer/${storeDomain}`}
            className="text-base font-semibold whitespace-nowrap"
          >
            ecommerce
          </Link>
        </div>

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
            key={currentKeyword}
            type="search"
            name={KEYWORD_FIELD_NAME}
            defaultValue={currentKeyword}
            placeholder="상품 검색"
            className="pl-9"
            aria-label="상품 검색"
          />
        </form>

        <nav className="flex items-center gap-1">
          <CartIconWithBadge href={`/consumer/${storeDomain}/cart`} />
          <UserMenu mypageHref={`/consumer/${storeDomain}/mypage/orders`} />
        </nav>
      </div>
    </header>
  );
}
