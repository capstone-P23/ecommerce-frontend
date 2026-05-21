'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useSellerMembers } from '@/lib/queries/seller-mock';

import { MockNotice } from './mock-notice';

export function SellerMembersView() {
  const { data: members, isLoading } = useSellerMembers();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const list = members ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <MockNotice />
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">이름</th>
                  <th className="px-4 py-2.5">이메일</th>
                  <th className="px-4 py-2.5">가입일</th>
                  <th className="px-4 py-2.5">주문 수</th>
                  <th className="px-4 py-2.5">총 구매</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.memberId} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{m.memberId}</td>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(m.joinedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">{m.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(m.totalSpent, m.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
