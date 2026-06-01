'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth/store';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/queries/cart';
import { useCreateOrder } from '@/lib/queries/orders';
import { cn } from '@/lib/utils';
import type { DeliveryFormValues } from '@/lib/schemas/delivery';

import { DeliveryForm } from './delivery-form';

const CHECKOUT_FORM_ID = 'checkout-delivery-form';

// TODO: 백엔드가 CartItemResponse 에 skuId 를 제공하면 이 fallback 제거.
// 현재 mock 컨벤션 (productId * 100 + 1) 과 동일하게 임시 변환.
// const fallbackSkuId = (productId: number) => productId * 100 + 1;

type Props = {
  storeDomain: string;
};

/**
 * 체크아웃 — 카트 항목 확인 + 배송 정보 입력 + 주문 생성.
 *
 * 흐름:
 *   1. cart 비어있으면 cart 페이지로 안내
 *   2. delivery form 검증 통과 → POST /api/orders/me
 *   3. 성공 → /mypage/orders/{orderNumber} 이동 (서버가 카트도 비움)
 */
export function CheckoutView({ storeDomain }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const cartQuery = useCart();
  const createMutation = useCreateOrder();

  if (!accessToken) return <CheckoutLoginPrompt />;
  if (cartQuery.isLoading) return <CheckoutSkeleton />;

  const cart = cartQuery.data;
  if (!cart || cart.items.length === 0) return <CheckoutEmpty storeDomain={storeDomain} />;

  const handleSubmit = (delivery: DeliveryFormValues) => {
    createMutation.mutate(
      {
        items: cart.items.map((it) => ({
          productId: it.productId,
          skuId: it.skuId,
          quantity: it.quantity,
        })),
        delivery,
      },
      {
        onSuccess: (order) => {
          toast.success(`주문이 완료되었습니다 (${order.orderNumber})`);
          router.push(`/consumer/${storeDomain}/mypage/orders/${order.orderNumber}`);
        },
        onError: (e) => toast.error(`주문 실패: ${e.message}`),
      },
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">주문 / 결제</h1>

        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-base font-semibold">배송지</h2>
            <DeliveryForm formId={CHECKOUT_FORM_ID} onSubmit={handleSubmit} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-base font-semibold">주문 상품 ({cart.itemCount}종)</h2>
            <ul className="divide-y divide-border">
              {cart.items.map((item) => (
                <li
                  key={item.itemId}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="size-12 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}개 × {formatPrice(item.currentPrice, item.currency)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.subtotal, item.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-3">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-base font-semibold">결제 정보</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">상품 합계</span>
              <span>{formatPrice(cart.totalAmount, cart.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">배송비</span>
              <span>0원</span>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-sm">결제 예정 금액</span>
              <span className="text-xl font-bold">
                {formatPrice(cart.totalAmount, cart.currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          form={CHECKOUT_FORM_ID}
          size="lg"
          className="w-full"
          disabled={createMutation.isPending}
        >
          <ShoppingCart className="size-4" />
          {createMutation.isPending ? '주문 생성 중...' : '주문하기 (mock 결제)'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          ※ 실제 PG 결제는 백엔드 연동 후 활성화됩니다.
        </p>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 상태별 sub-views (Toss: separate components for different paths)
// ─────────────────────────────────────────────────────────────

function CheckoutLoginPrompt() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h1 className="text-xl font-semibold">로그인이 필요합니다</h1>
      <Link href="/login" className={cn(buttonVariants({ variant: 'default' }))}>
        로그인하러 가기
      </Link>
    </div>
  );
}

function CheckoutEmpty({ storeDomain }: { storeDomain: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h1 className="text-xl font-semibold">주문할 상품이 없습니다</h1>
      <p className="text-sm text-muted-foreground">먼저 장바구니에 상품을 담아주세요.</p>
      <Link
        href={`/consumer/${storeDomain}/products`}
        className={cn(buttonVariants({ variant: 'default' }))}
      >
        상품 둘러보기
      </Link>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-60 w-full" />
    </div>
  );
}
