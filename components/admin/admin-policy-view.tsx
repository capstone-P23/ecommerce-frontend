'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';
import {
  useSettlementPolicy,
  useUpdateSettlementPolicy,
} from '@/lib/queries/admin-mock';
import type { SettlementCycle, SettlementPolicy } from '@/types/api';

import { AdminMockNotice } from './admin-mock-notice';

const CYCLE_LABEL: Record<SettlementCycle, string> = {
  WEEKLY: '주간',
  MONTHLY: '월간',
};

export function AdminPolicyView() {
  const { data: policy, isLoading } = useSettlementPolicy();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!policy) return null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">정산 정책</h1>
        <AdminMockNotice />
      </header>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-base font-semibold">현재 정책</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">수수료율</dt>
            <dd>{(policy.commissionRate * 100).toFixed(2)}%</dd>
            <dt className="text-muted-foreground">정산 주기</dt>
            <dd>{CYCLE_LABEL[policy.cycle]}</dd>
            <dt className="text-muted-foreground">최소 지급액</dt>
            <dd>{formatPrice(policy.minimumPayout, policy.currency)}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* policy 가 갱신되면 key 변화 → form 자동 remount + 새 initial values 적용
          (useEffect 안 setState 패턴 회피 — React 19 룰) */}
      <PolicyEditForm
        key={`${policy.commissionRate}-${policy.cycle}-${policy.minimumPayout}`}
        policy={policy}
      />
    </div>
  );
}

function PolicyEditForm({ policy }: { policy: SettlementPolicy }) {
  const [ratePercent, setRatePercent] = useState(
    Math.round(policy.commissionRate * 10_000) / 100,
  );
  const [cycle, setCycle] = useState<SettlementCycle>(policy.cycle);
  const [minimumPayout, setMinimumPayout] = useState(policy.minimumPayout);

  const updateMutation = useUpdateSettlementPolicy();

  const handleSave = () => {
    updateMutation.mutate(
      {
        commissionRate: ratePercent / 100,
        cycle,
        minimumPayout,
      },
      {
        onSuccess: () => toast.success('정책이 저장되었습니다.'),
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="text-base font-semibold">수정</h2>
        <div className="space-y-1.5">
          <Label>수수료율 (%)</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={ratePercent}
            onChange={(e) => setRatePercent(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>정산 주기</Label>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as SettlementCycle)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="WEEKLY">{CYCLE_LABEL.WEEKLY}</option>
            <option value="MONTHLY">{CYCLE_LABEL.MONTHLY}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>최소 지급액 (원)</Label>
          <Input
            type="number"
            min={0}
            value={minimumPayout}
            onChange={(e) => setMinimumPayout(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
