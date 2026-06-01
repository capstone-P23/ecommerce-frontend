'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { ComingSoonSection } from '@/components/consumer/coming-soon-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminBanners,
  useDeleteBanner,
  usePublishBanner,
  useUpdateBanner,
} from '@/lib/queries/admin';
import type { Banner, BannerStatus } from '@/types/api';

export function AdminContentsView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">컨텐츠 / 보안 로그</h1>
      </header>

      <BannersSection />
      <ComingSoonSection title="보안 로그" plannedPhase="백엔드 구현 후" />
    </div>
  );
}

function BannersSection() {
  const { data, isLoading } = useAdminBanners();
  const publishMutation = usePublishBanner();
  const deleteMutation = useDeleteBanner();
  const updateMutation = useUpdateBanner();

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  const list = data ?? [];

  const handlePublish = (id: number) => {
    publishMutation.mutate(id, {
      onSuccess: () => toast.success('배너가 게시되었습니다.'),
      onError: (e) => toast.error(`실패: ${e.message}`),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('배너를 삭제할까요?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('배너가 삭제되었습니다.'),
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
              className="rounded border border-border p-3"
            >
              <BannerItem
                banner={banner}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onUpdate={(input) => updateMutation.mutate(input)}
                isPublishing={publishMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BannerItem({
  banner,
  onPublish,
  onDelete,
  onUpdate,
  isPublishing,
  isDeleting,
}: {
  banner: Banner;
  onPublish: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (input: {
    bannerId: number;
    name: string;
    imageUrl: string;
    linkUrl?: string;
    startAt: string;
    endAt: string;
    displayOrder: number;
  }) => void;
  isPublishing: boolean;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: banner.name,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl,
    startAt: banner.startAt,
    endAt: banner.endAt,
    displayOrder: String(banner.displayOrder),
  });

  const handleSave = () => {
    onUpdate({
      bannerId: banner.bannerId,
      name: formState.name,
      imageUrl: formState.imageUrl,
      linkUrl: formState.linkUrl,
      startAt: formState.startAt,
      endAt: formState.endAt,
      displayOrder: Number(formState.displayOrder),
    });
    toast.success('배너가 수정되었습니다.');
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imageUrl}
          alt={banner.name}
          className="h-12 w-32 rounded object-cover"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{banner.name}</p>
            <Badge variant={statusVariant(banner.status)}>
              {statusLabel(banner.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{banner.linkUrl}</p>
          <p className="text-xs text-muted-foreground">
            {banner.startAt} ~ {banner.endAt}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {banner.status === 'DRAFT' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPublish(banner.bannerId)}
            disabled={isPublishing}
          >
            게시
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" variant="outline" />}>
            수정
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>배너 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>이름</Label>
                <Input
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>이미지 URL</Label>
                <Input
                  value={formState.imageUrl}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>링크 URL</Label>
                <Input
                  value={formState.linkUrl ?? ''}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      linkUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>시작일</Label>
                <Input
                  value={formState.startAt}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      startAt: e.target.value,
                    }))
                  }
                  placeholder="2026-06-01T09:00:00"
                />
              </div>
              <div className="space-y-1">
                <Label>종료일</Label>
                <Input
                  value={formState.endAt}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      endAt: e.target.value,
                    }))
                  }
                  placeholder="2026-06-30T23:59:59"
                />
              </div>
              <div className="space-y-1">
                <Label>노출 순서</Label>
                <Input
                  value={formState.displayOrder}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      displayOrder: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(banner.bannerId)}
          disabled={isDeleting}
        >
          삭제
        </Button>
      </div>
    </div>
  );
}

function statusLabel(status: BannerStatus) {
  return {
    DRAFT: '작성중',
    SCHEDULED: '예약',
    PUBLISHED: '게시중',
    EXPIRED: '종료',
  }[status];
}

function statusVariant(status: BannerStatus) {
  if (status === 'PUBLISHED') return 'secondary';
  if (status === 'EXPIRED') return 'destructive';
  return 'default';
}
