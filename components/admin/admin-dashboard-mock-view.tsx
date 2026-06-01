'use client';

import { BarChart3, RotateCcw, ShoppingBag, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import {
  useAdminPaymentsTimeSeries,
  useAdminRefundsTimeSeries,
  useAdminSalesStats,
  useAdminSalesTimeSeries,
} from '@/lib/queries/admin';

const SKELETON_COUNT = 3;

export function AdminDashboardMockView() {
  const params = {
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    unit: 'DAILY' as const,
  };
  const { data: sales, isLoading: salesLoading } =
    useAdminSalesTimeSeries(params);
  const { data: refunds, isLoading: refundsLoading } =
    useAdminRefundsTimeSeries(params);
  const { data: payments, isLoading: paymentsLoading } =
    useAdminPaymentsTimeSeries(params);
  const { data: stats, isLoading: statsLoading } = useAdminSalesStats(params);
  const isLoading =
    salesLoading || refundsLoading || paymentsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  if (!sales || !refunds || !payments || !stats) return null;

  const cards = [
    {
      icon: TrendingUp,
      label: '총 매출',
      value: formatPrice(sales.totalRevenue),
    },
    {
      icon: ShoppingBag,
      label: '주문 수',
      value: `${sales.totalOrderCount.toLocaleString()}건`,
    },
    {
      icon: RotateCcw,
      label: '환불 수',
      value: `${refunds.totalRefundCount.toLocaleString()}건`,
    },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">결제/환불 요약</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryItem
              icon={BarChart3}
              label="결제 합계"
              value={formatPrice(payments.totalAmount)}
            />
            <SummaryItem
              icon={ShoppingBag}
              label="결제 건수"
              value={`${payments.totalPaymentCount.toLocaleString()}건`}
            />
            <SummaryItem
              icon={RotateCcw}
              label="환불 금액"
              value={formatPrice(refunds.totalRefundAmount)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">판매 통계</h2>
          <div className="text-sm text-muted-foreground">
            주문 {stats.orderCount.toLocaleString()}건 · 취소{' '}
            {stats.cancelCount.toLocaleString()}건
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">상품</th>
                  <th className="py-2">판매 수량</th>
                  <th className="py-2">매출</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularProducts.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2">
                      {item.totalSoldQuantity.toLocaleString()}
                    </td>
                    <td className="py-2">{formatPrice(item.totalRevenue)}</td>
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

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
