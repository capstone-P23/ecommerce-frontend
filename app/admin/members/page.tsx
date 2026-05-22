import { AdminMembersView } from '@/components/admin/admin-members-view';

// useSearchParams 사용 — 정적 prerender 불가
export const dynamic = 'force-dynamic';

// Admin 회원 관리 — 목록 + 필터 (phase 7b)
export default function AdminMembersPage() {
  return <AdminMembersView />;
}
