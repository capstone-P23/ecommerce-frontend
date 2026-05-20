/**
 * 표시 포맷 유틸.
 */

// 백엔드가 ProductSummary / ProductDetail 에 currency 코드를 함께 주므로 그대로 사용.
const KRW_FORMATTER = new Intl.NumberFormat('ko-KR');

export function formatPrice(amount: number, currency = 'KRW'): string {
  if (currency === 'KRW') return `${KRW_FORMATTER.format(amount)}원`;
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(amount);
}
