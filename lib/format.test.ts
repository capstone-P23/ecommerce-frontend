import { formatPrice } from './format';

describe('formatPrice', () => {
  it('KRW 는 천 단위 구분 + "원" suffix 로 포맷한다', () => {
    expect(formatPrice(12_000)).toBe('12,000원');
    expect(formatPrice(0)).toBe('0원');
    expect(formatPrice(1_234_567)).toBe('1,234,567원');
  });

  it('소수점 가격은 그대로 천 단위 구분', () => {
    expect(formatPrice(1500.5)).toBe('1,500.5원');
  });

  it('non-KRW 통화는 Intl.NumberFormat 기본 currency 표시를 사용한다', () => {
    // ko-KR 로케일에서의 USD 표기 확인 (정확한 문자열은 환경별로 달라질 수 있어 포함 여부만 검증)
    const usd = formatPrice(10, 'USD');
    expect(usd).toMatch(/10/);
    expect(usd).toMatch(/\$|USD/);
  });
});
