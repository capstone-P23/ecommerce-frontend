// 장바구니 in-memory 상태.
// MSW 핸들러가 mutation 시 이 변수를 직접 수정 (dev 세션 동안만 유지).
// 페이지 새로고침 후에도 유지되며, dev 서버 재시작 시 초기화.

import type { Cart, CartItem } from '@/types/api';

import { mockProductSummaries } from './products';

const findProduct = (productId: number) =>
  mockProductSummaries.find((p) => p.id === productId);

const buildCartItem = (
  itemId: number,
  productId: number,
  quantity: number,
): CartItem | null => {
  const product = findProduct(productId);
  if (!product) return null;

  return {
    itemId,
    skuId: product.id * 10, // SKU 는 productId 기반으로 임의 생성
    productId,
    productName: product.name,
    productImageUrl: product.mainImageUrl,
    currentPrice: product.price,
    currency: product.currency,
    quantity,
    subtotal: product.price * quantity,
    available: product.status === 'ACTIVE' && product.inStock,
  };
};

const initialItems = (
  [
    { itemId: 1, productId: 1, quantity: 2 },
    { itemId: 2, productId: 5, quantity: 1 },
  ] satisfies Array<{ itemId: number; productId: number; quantity: number }>
)
  .map(({ itemId, productId, quantity }) =>
    buildCartItem(itemId, productId, quantity),
  )
  .filter((x): x is CartItem => x !== null);

// 모듈 mutable 상태 (의도적)
export const cartState = {
  cartId: 1,
  items: initialItems,
  /** 다음 새 아이템에 부여할 itemId (자동 증가) */
  nextItemId: 100,
};

/** 현재 state 로부터 CartResponse 형태로 빌드 */
export function snapshotCart(): Cart {
  const totalAmount = cartState.items.reduce((sum, it) => sum + it.subtotal, 0);
  const totalQuantity = cartState.items.reduce(
    (sum, it) => sum + it.quantity,
    0,
  );
  const currency = cartState.items[0]?.currency ?? 'KRW';

  return {
    cartId: cartState.cartId,
    items: cartState.items,
    totalAmount,
    currency,
    itemCount: cartState.items.length,
    totalQuantity,
  };
}

/** Add cart item — 같은 productId 가 이미 있으면 quantity 누적 */
export function addCartItem(productId: number, quantity: number): void {
  const existing = cartState.items.find((it) => it.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = existing.currentPrice * existing.quantity;
    return;
  }
  const created = buildCartItem(cartState.nextItemId++, productId, quantity);
  if (created) cartState.items.push(created);
}

export function updateCartItemQuantity(itemId: number, quantity: number): void {
  const target = cartState.items.find((it) => it.itemId === itemId);
  if (!target) return;
  target.quantity = quantity;
  target.subtotal = target.currentPrice * quantity;
}

export function removeCartItem(itemId: number): void {
  cartState.items = cartState.items.filter((it) => it.itemId !== itemId);
}

export function clearCart(): void {
  cartState.items = [];
}
