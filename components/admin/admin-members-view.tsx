'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminMembers } from '@/lib/queries/admin';
import type { MemberStatus } from '@/types/api';

import { AdminMemberStatusBadge } from './admin-member-status-badge';

const STATUS_PARAM = 'status';
const KEYWORD_PARAM = 'keyword';

const STATUS_OPTIONS: Array<{ value: MemberStatus | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'PENDING', label: '대기' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
];

export function AdminMembersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get(STATUS_PARAM) || null) as MemberStatus | null;
  const keyword = searchParams.get(KEYWORD_PARAM) ?? '';

  const { data, isLoading } = useAdminMembers({ status, keyword });

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || value === '') params.delete(key);
    else params.set(key, value);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const items = data?.content ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <p className="text-sm text-muted-foreground">
          총 {data?.totalElements.toLocaleString() ?? 0}명
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status ?? ''}
          onChange={(e) => updateParam(STATUS_PARAM, e.target.value || null)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Input
          // 키워드 검색은 typing 시점 url 반영하면 너무 잦은 fetch → onBlur 로 반영
          defaultValue={keyword}
          onBlur={(e) => updateParam(KEYWORD_PARAM, e.target.value.trim() || null)}
          placeholder="이름 / 이메일 검색"
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">이름</th>
                  <th className="px-4 py-2.5">이메일</th>
                  <th className="px-4 py-2.5">역할</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5">이메일 인증</th>
                  <th className="px-4 py-2.5">가입일</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      조건에 맞는 회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/admin/members/${m.id}`} className="hover:underline">
                          {m.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{m.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-4 py-3 text-xs">{m.role}</td>
                      <td className="px-4 py-3">
                        <AdminMemberStatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {m.emailVerified ? '✓' : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
