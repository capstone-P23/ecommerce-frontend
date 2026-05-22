import { notFound } from 'next/navigation';

import { AdminMemberDetailView } from '@/components/admin/admin-member-detail-view';

// Admin 회원 상세 + 블랙리스트 / 삭제 (phase 7b)
export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isFinite(numeric) || numeric <= 0) notFound();
  return <AdminMemberDetailView memberId={numeric} />;
}
