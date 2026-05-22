'use client';

import { Bell, ShoppingBag, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useAdminDashboardStats } from '@/lib/queries/admin-mock';

import { AdminMockNotice } from './admin-mock-notice';

const SKELETON_COUNT = 4;

export function AdminDashboardMockView() {
  const { data, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const cards = [
    {
      icon: TrendingUp,
      label: '총 매출',
      value: formatPrice(data.grossSales, data.currency),
    },
    { icon: ShoppingBag, label: '총 주문', value: `${data.totalOrders.toLocaleString()}건` },
    { icon: Users, label: '총 회원', value: `${data.totalMembers.toLocaleString()}명` },
    { icon: Bell, label: '안 읽음 알림', value: `${data.unreadNotifications}` },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <AdminMockNotice />
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">활성 판매자: {data.activeSellers}명</p>
    </div>
  );
}
