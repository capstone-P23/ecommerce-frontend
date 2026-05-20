'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth/store';
import { useCart, useClearCart } from '@/lib/queries/cart';
import { cn } from '@/lib/utils';

import { CartItemRow } from './cart-item-row';
import { CartSummary } from './cart-summary';

type Props = {
  storeDomain: string;
};

const SKELETON_ROW_COUNT = 2;

export function CartView({ storeDomain }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const cartQuery = useCart();
  const clearMutation = useClearCart();

  if (!accessToken) return <CartLoginPrompt />;
  if (cartQuery.isLoading) return <CartSkeleton />;
  if (cartQuery.isError) return <CartError message={(cartQuery.error as Error)?.message} />;

  const cart = cartQuery.data;
  if (!cart || cart.items.length === 0) return <CartEmpty storeDomain={storeDomain} />;

  const handleClear = () => {
    clearMutation.mutate(undefined, {
      onSuccess: () => toast.success('장바구니를 비웠습니다.'),
      onError: (e) => toast.error(`초기화 실패: ${e.message}`),
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">장바구니</h1>
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={clearMutation.isPending}
                />
              }
            >
              <Trash2 className="size-4" />
              전체 비우기
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>장바구니를 비우시겠어요?</DialogTitle>
                <DialogDescription>
                  담긴 상품 {cart.itemCount}종이 모두 삭제됩니다. 되돌릴 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleClear}>
                  비우기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div>
          {cart.items.map((item) => (
            <CartItemRow
              key={item.itemId}
              item={item}
              productHref={`/consumer/${storeDomain}/products/${item.productId}`}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-3">
        <CartSummary cart={cart} />
        <Button type="button" size="lg" disabled className="w-full">
          <ShoppingCart className="size-4" />
          주문하기 (Phase 5c 예정)
        </Button>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 상태별 sub-views (Toss: separate components for different paths)
// ─────────────────────────────────────────────────────────────

function CartLoginPrompt() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <ShoppingCart className="mx-auto size-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">로그인이 필요합니다</h1>
      <p className="text-sm text-muted-foreground">
        장바구니를 보려면 먼저 로그인해주세요.
      </p>
      <Link href="/login" className={cn(buttonVariants({ variant: 'default' }))}>
        로그인하러 가기
      </Link>
    </div>
  );
}

function CartEmpty({ storeDomain }: { storeDomain: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <ShoppingCart className="mx-auto size-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">장바구니가 비어있습니다</h1>
      <p className="text-sm text-muted-foreground">담아둔 상품이 아직 없어요.</p>
      <Link
        href={`/consumer/${storeDomain}/products`}
        className={cn(buttonVariants({ variant: 'default' }))}
      >
        상품 둘러보기
      </Link>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function CartError({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-md space-y-2 py-12 text-center">
      <p className="text-sm text-destructive">{message ?? '장바구니를 불러오지 못했습니다.'}</p>
    </div>
  );
}
