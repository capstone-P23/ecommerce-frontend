'use client';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminBanners,
  useAdminSecurityLogs,
  useToggleBannerActive,
} from '@/lib/queries/admin-mock';
import type { SecurityLogType } from '@/types/api';

import { AdminMockNotice } from './admin-mock-notice';

const LOG_TYPE_LABEL: Record<SecurityLogType, string> = {
  LOGIN_FAILURE: '로그인 실패',
  PERMISSION_DENIED: '권한 거부',
  SUSPICIOUS_REQUEST: '의심 요청',
};

const LOG_TYPE_VARIANT: Record<SecurityLogType, 'default' | 'destructive'> = {
  LOGIN_FAILURE: 'destructive',
  PERMISSION_DENIED: 'destructive',
  SUSPICIOUS_REQUEST: 'default',
};

export function AdminContentsView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">컨텐츠 / 보안 로그</h1>
        <AdminMockNotice />
      </header>

      <BannersSection />
      <SecurityLogsSection />
    </div>
  );
}

function BannersSection() {
  const { data, isLoading } = useAdminBanners();
  const toggleMutation = useToggleBannerActive();

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  const list = data ?? [];

  const handleToggle = (id: number) => {
    toggleMutation.mutate(id, {
      onSuccess: (b) =>
        toast.success(b.active ? '배너 노출됨' : '배너 숨김 처리'),
      onError: (e) => toast.error(`실패: ${e.message}`),
    });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="text-base font-semibold">배너</h2>
        <ul className="space-y-2">
          {list.map((banner) => (
            <li
              key={banner.bannerId}
              className="flex items-center gap-3 rounded border border-border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-12 w-32 rounded object-cover"
                loading="lazy"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{banner.title}</p>
                  <Badge variant={banner.active ? 'secondary' : 'default'}>
                    {banner.active ? '노출' : '숨김'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{banner.linkUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggle(banner.bannerId)}
                disabled={toggleMutation.isPending}
              >
                {banner.active ? '숨김' : '노출'}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SecurityLogsSection() {
  const { data, isLoading } = useAdminSecurityLogs();
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  const list = data ?? [];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="text-base font-semibold">보안 로그</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2">유형</th>
                <th className="py-2">계정</th>
                <th className="py-2">IP</th>
                <th className="py-2">메시지</th>
                <th className="py-2">발생 시각</th>
              </tr>
            </thead>
            <tbody>
              {list.map((log) => (
                <tr key={log.logId} className="border-b border-border last:border-b-0">
                  <td className="py-2">
                    <Badge variant={LOG_TYPE_VARIANT[log.type]}>
                      {LOG_TYPE_LABEL[log.type]}
                    </Badge>
                  </td>
                  <td className="py-2 text-muted-foreground">{log.actorEmail ?? '-'}</td>
                  <td className="py-2 font-mono text-xs">{log.ipAddress}</td>
                  <td className="py-2">{log.message}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {new Date(log.occurredAt).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
