'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth/store';
import { useAddCartItem } from '@/lib/queries/cart';
import type { ProductDetail } from '@/types/api';

const DEFAULT_QUANTITY = 1;

type Props = {
  product: ProductDetail;
};

/**
 * 상품 상세의 "장바구니 담기" 버튼.
 * 자체적으로 인증 확인 / mutation / toast 까지 처리 (Dedicated Interaction Component).
 *
 * TODO: 옵션 다양한 상품(SKU 여러 개) 의 경우 옵션 선택 UI 가 위에 와야 함.
 *       현재 mock 은 SKU 1개씩이라 자동 첫 SKU 선택.
 */
export function AddToCartButton({ product }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addMutation = useAddCartItem();

  const firstAvailableSku = product.skus.find((sku) => sku.inStock);
  const isPurchasable =
    product.status === 'ACTIVE' && product.inStock && !!firstAvailableSku;
  const isAdding = addMutation.isPending;

  const handleClick = () => {
    if (!accessToken) {
      toast.info('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    if (!firstAvailableSku) return;

    addMutation.mutate(
      {
        productId: product.id,
        skuId: firstAvailableSku.skuId,
        quantity: DEFAULT_QUANTITY,
      },
      {
        onSuccess: () => toast.success('장바구니에 담았습니다.'),
        onError: (e) => toast.error(`담기 실패: ${e.message}`),
      },
    );
  };

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={!isPurchasable || isAdding}
      onClick={handleClick}
    >
      <ShoppingCart className="size-4" />
      {isAdding ? '담는 중...' : '장바구니 담기'}
    </Button>
  );
}
