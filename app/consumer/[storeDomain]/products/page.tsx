import { ProductListView } from '@/components/consumer/product-list-view';

// [PRD-001, PRD-003] 상품 검색 / 카테고리 필터 / 페이지네이션
export default async function ConsumerProductsPage({
  params,
}: {
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;
  return <ProductListView storeDomain={storeDomain} />;
}
