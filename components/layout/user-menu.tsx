'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/auth/store';
import { useLogout, useMe } from '@/lib/auth/queries';
import { cn } from '@/lib/utils';

type Props = {
  /** 마이페이지 링크 — 컨텍스트(storeDomain 등) 따라 호출자가 빌드 */
  mypageHref: string;
};

/**
 * 헤더용 로그인 상태 표시.
 * - 비로그인: "로그인" 링크 버튼
 * - 로그인: 아바타 + dropdown (마이페이지 / 로그아웃)
 */
export function UserMenu({ mypageHref }: Props) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: me } = useMe();
  const logoutMutation = useLogout();

  if (!accessToken) {
    return (
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
      >
        <LogIn className="size-4" />
        로그인
      </Link>
    );
  }

  const initial = me?.name?.[0] ?? me?.email?.[0]?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success('로그아웃되었습니다.');
        router.push('/');
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`사용자 메뉴 ${me?.name ?? ''}`}
          />
        }
      >
        <Avatar className="size-7">
          {me?.picture && <AvatarImage src={me.picture} alt="" />}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{me?.name ?? '사용자'}</p>
          {me?.email && (
            <p className="text-xs text-muted-foreground">{me.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={mypageHref} />}>
          <User className="size-4" />
          마이페이지
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
