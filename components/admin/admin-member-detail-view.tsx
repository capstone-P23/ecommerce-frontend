'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminMember,
  useDeleteMember,
  useSetBlacklist,
} from '@/lib/queries/admin';

import { AdminMemberStatusBadge } from './admin-member-status-badge';

type Props = {
  memberId: number;
};

export function AdminMemberDetailView({ memberId }: Props) {
  const router = useRouter();
  const { data: member, isLoading } = useAdminMember(memberId);
  const blacklistMutation = useSetBlacklist();
  const deleteMutation = useDeleteMember();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!member) return null;

  const isBlacklisted = member.status === 'SUSPENDED';

  const handleBlacklist = () => {
    blacklistMutation.mutate(
      { memberId: member.id, blacklisted: !isBlacklisted },
      {
        onSuccess: () =>
          toast.success(isBlacklisted ? '정지 해제됨' : '블랙리스트 등록됨'),
        onError: (e) => toast.error(`실패: ${e.message}`),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(member.id, {
      onSuccess: () => {
        toast.success('회원이 삭제되었습니다.');
        router.push('/admin/members');
      },
      onError: (e) => toast.error(`삭제 실패: ${e.message}`),
    });
  };

  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <Link href="/admin/members" className="text-sm text-muted-foreground hover:underline">
          ← 회원 목록
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">#{member.id} · {member.name}</h1>
          <AdminMemberStatusBadge status={member.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {member.email} · {member.role} · 가입일 {new Date(member.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </header>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <h2 className="text-base font-semibold">계정 정보</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">이메일 인증</dt>
            <dd>{member.emailVerified ? '완료' : '미완료'}</dd>
            <dt className="text-muted-foreground">상태</dt>
            <dd>{member.status}</dd>
            <dt className="text-muted-foreground">권한</dt>
            <dd>{member.role}</dd>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={isBlacklisted ? 'outline' : 'destructive'}
          onClick={handleBlacklist}
          disabled={blacklistMutation.isPending}
        >
          {isBlacklisted ? '정지 해제' : '블랙리스트 등록'}
        </Button>

        <Dialog>
          <DialogTrigger render={<Button variant="ghost" />}>
            회원 삭제
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>회원을 삭제하시겠어요?</DialogTitle>
              <DialogDescription>
                {member.name} ({member.email}) 계정이 삭제됩니다. 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                삭제 확정
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
