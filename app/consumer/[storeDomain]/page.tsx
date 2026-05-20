import { ConsumerHomeView } from '@/components/consumer/consumer-home-view';

// [PRD-002, PRD-003] 홈 — 카테고리 + 상품 첫 페이지 미리보기
// (AI 추천은 백엔드 미구현 — 일반 리스트로 대체)
export default async function ConsumerHomePage({
  params,
}: {
  params: Promise<{ storeDomain: string }>;
}) {
  const { storeDomain } = await params;
  return <ConsumerHomeView storeDomain={storeDomain} />;
}
