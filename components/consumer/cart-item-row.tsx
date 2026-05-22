'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import {
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/lib/queries/cart';
import type { CartItem } from '@/types/api';

const MIN_QUANTITY = 1; // 백엔드 minimum 제약. 0 만들고 싶으면 삭제 사용.

type Props = {
  item: CartItem;
  /** 클릭 시 이동할 상품 상세 경로 빌더 — storeDomain 컨텍스트는 부모가 갖고 있으므로 위임 */
  productHref: string;
};

export function CartItemRow({ item, productHref }: Props) {
  const updateMutation = useUpdateCartItemQuantity();
  const removeMutation = useRemoveCartItem();

  const isMutating = updateMutation.isPending || removeMutation.isPending;
  const canDecrease = item.quantity > MIN_QUANTITY && !isMutating;
  const canIncrease = !isMutating;

  const changeQuantity = (nextQuantity: number) => {
    if (nextQuantity < MIN_QUANTITY) return;
    updateMutation.mutate(
      { itemId: item.itemId, quantity: nextQuantity },
      { onError: (e) => toast.error(`수량 변경 실패: ${e.message}`) },
    );
  };

  const remove = () => {
    removeMutation.mutate(item.itemId, {
      onSuccess: () => toast.success(`${item.productName} 을 장바구니에서 제거했습니다.`),
      onError: (e) => toast.error(`삭제 실패: ${e.message}`),
    });
  };

  return (
    <article
      className={cn(
        'flex gap-4 border-b border-border py-4 last:border-b-0',
        !item.available && 'opacity-60',
      )}
    >
      <Link
        href={productHref}
        className="relative block size-24 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={item.productImageUrl}
          alt={item.productName}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={productHref} className="line-clamp-2 text-sm font-medium hover:underline">
            {item.productName}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={remove}
            disabled={isMutating}
            aria-label={`${item.productName} 삭제`}
          >
            <X className="size-4" />
          </Button>
        </div>

        {!item.available && (
          <p className="text-xs text-destructive">현재 구매할 수 없는 상품입니다.</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => changeQuantity(item.quantity - 1)}
              disabled={!canDecrease}
              aria-label="수량 감소"
            >
              <Minus className="size-3" />
            </Button>
            <span
              aria-live="polite"
              aria-label={`수량 ${item.quantity}`}
              className="min-w-8 text-center text-sm tabular-nums"
            >
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => changeQuantity(item.quantity + 1)}
              disabled={!canIncrease}
              aria-label="수량 증가"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <p className="text-base font-semibold">
            {formatPrice(item.subtotal, item.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
