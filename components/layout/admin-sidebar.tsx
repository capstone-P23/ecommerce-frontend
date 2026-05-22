'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  ScrollText,
  Package,
  FolderTree,
  UserCog,
  Bell,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useMe } from '@/lib/auth/queries';

import { SidebarLogoutButton } from './sidebar-logout-button';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// 관리자 사이드바 메뉴 — 백엔드 정렬 (phase 7a~) + 설계서 기존 mock 영역 혼재
const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/products', label: '상품', icon: Package },
  { href: '/admin/categories', label: '카테고리', icon: FolderTree },
  { href: '/admin/members', label: '회원', icon: UserCog },
  { href: '/admin/notifications', label: '알림', icon: Bell },
  { href: '/admin/sellers', label: '판매자 관리', icon: Users },
  { href: '/admin/policy', label: '정산 정책', icon: FileText },
  { href: '/admin/contents', label: '컨텐츠 / 보안 로그', icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5">
        <Link href="/admin/dashboard" className="text-base font-semibold">
          관리자 콘솔
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      <SidebarUser />
      <div className="p-2">
        <SidebarLogoutButton />
      </div>
    </aside>
  );
}

function SidebarUser() {
  const { data: me } = useMe();
  const initial = me?.name?.[0] ?? 'A';

  return (
    <div className="flex items-center gap-3 p-3">
      <Avatar className="size-8">
        {me?.picture && <AvatarImage src={me.picture} alt="" />}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="text-xs leading-tight">
        <p className="font-medium">{me?.name ?? '관리자'}</p>
        {me?.email && (
          <p className="truncate text-muted-foreground">{me.email}</p>
        )}
      </div>
    </div>
  );
}
