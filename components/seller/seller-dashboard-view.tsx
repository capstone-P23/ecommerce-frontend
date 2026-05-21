'use client';

import { AlertTriangle, Package, ShoppingCart, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import { useSellerStats } from '@/lib/queries/seller-mock';

const SKELETON_COUNT = 4;

export function SellerDashboardView() {
  const { data: stats, isLoading } = useSellerStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  if (!stats) return null;

  const cards = [
    { icon: TrendingUp, label: '오늘 매출', value: formatPrice(stats.revenueToday, stats.currency) },
    { icon: ShoppingCart, label: '오늘 주문', value: `${stats.ordersToday}건` },
    { icon: AlertTriangle, label: '재고 알림', value: `${stats.stockAlerts}건` },
    { icon: Package, label: '배송 대기', value: `${stats.pendingShipments}건` },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-xs text-muted-foreground">⚠️ 백엔드 endpoint 미정 — mock 데이터</p>
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
    </div>
  );
}
