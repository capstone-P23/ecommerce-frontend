'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/auth/queries';

/**
 * admin / seller 사이드바 하단의 로그아웃 버튼.
 */
export function SidebarLogoutButton() {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success('로그아웃되었습니다.');
        router.push('/');
      },
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="w-full justify-start"
    >
      <LogOut className="size-4" />
      로그아웃
    </Button>
  );
}
