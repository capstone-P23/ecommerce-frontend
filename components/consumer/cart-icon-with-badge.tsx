'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useCart } from '@/lib/queries/cart';

const MAX_BADGE_DISPLAY = 99;

type Props = {
  href: string;
};

/**
 * 헤더용 장바구니 아이콘 + 카운터 배지.
 * 비로그인이면 useCart 가 disabled 라 배지 없음.
 */
export function CartIconWithBadge({ href }: Props) {
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;
  const displayCount = count > MAX_BADGE_DISPLAY ? `${MAX_BADGE_DISPLAY}+` : String(count);

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
      aria-label={count > 0 ? `장바구니 (${count}개)` : '장바구니'}
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
        >
          {displayCount}
        </span>
      )}
    </Link>
  );
}
