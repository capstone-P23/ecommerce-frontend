import { productKeys } from './products';

describe('productKeys 팩토리', () => {
  it('all 은 정적 키', () => {
    expect(productKeys.all).toEqual(['products']);
  });

  it('lists / list 는 all 을 prefix 로 포함한다 (계층 invalidation 가능)', () => {
    const lists = productKeys.lists();
    expect(lists.slice(0, productKeys.all.length)).toEqual(productKeys.all);

    const params = { keyword: 'mango', page: 0 };
    const list = productKeys.list(params);
    expect(list.slice(0, lists.length)).toEqual(lists);
    expect(list.at(-1)).toEqual(params);
  });

  it('detail 은 동일 id 에 대해 동일 키를 반환한다 (캐시 키 일관성)', () => {
    const a = productKeys.detail(1);
    const b = productKeys.detail(1);
    expect(a).toEqual(b);
    expect(a.at(-1)).toBe(1);
  });

  it('서로 다른 list 파라미터는 다른 키를 생성한다', () => {
    expect(productKeys.list({ keyword: 'a' })).not.toEqual(
      productKeys.list({ keyword: 'b' }),
    );
  });
});
