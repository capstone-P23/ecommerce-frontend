'use client';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminNotifications,
  useAdminUnreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/lib/queries/admin';
import type { Notification } from '@/types/api';

const TYPE_LABEL: Record<Notification['type'], string> = {
  SOLD_OUT: '품절 알림',
};

export function AdminNotificationsView() {
  const { data, isLoading } = useAdminNotifications();
  const { data: unread } = useAdminUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const items = data?.content ?? [];
  const unreadTotal = unread?.count ?? 0;

  const handleMarkAll = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success('모두 읽음 처리'),
      onError: (e) => toast.error(`실패: ${e.message}`),
    });
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          <p className="text-sm text-muted-foreground">
            안 읽음 <strong>{unreadTotal}</strong>건 / 전체 {data?.totalElements ?? 0}건
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAll}
          disabled={markAllRead.isPending || unreadTotal === 0}
        >
          모두 읽음
        </Button>
      </header>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {items.length === 0 ? (
              <li className="p-8 text-center text-sm text-muted-foreground">알림이 없습니다.</li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={n.isRead ? 'secondary' : 'default'}>
                        {TYPE_LABEL[n.type]}
                      </Badge>
                      {!n.isRead && <span className="text-xs text-destructive">●</span>}
                    </div>
                    <p className="text-sm">
                      {n.productName}{' '}
                      <span className="text-xs text-muted-foreground">
                        ({n.skuOptionsSnapshot})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(n.occurredAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        markRead.mutate(n.id, {
                          onError: (e) => toast.error(`실패: ${e.message}`),
                        })
                      }
                      disabled={markRead.isPending}
                    >
                      읽음
                    </Button>
                  )}
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
