import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/format';
import type { Cart } from '@/types/api';

type Props = {
  cart: Cart;
};

export function CartSummary({ cart }: Props) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="text-base font-semibold">주문 요약</h2>

        <dl className="space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <dt>상품 종류</dt>
            <dd>{cart.itemCount}종</dd>
          </div>
          <div className="flex justify-between">
            <dt>총 수량</dt>
            <dd>{cart.totalQuantity}개</dd>
          </div>
        </dl>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-sm">결제 예정 금액</span>
          <span className="text-xl font-bold">
            {formatPrice(cart.totalAmount, cart.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
