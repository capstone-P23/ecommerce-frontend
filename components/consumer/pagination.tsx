'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  /** 0-indexed 현재 페이지 (Spring Pageable 컨벤션) */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const MAX_PAGE_NUMBERS_VISIBLE = 5;

const buildVisiblePages = (current: number, total: number): number[] => {
  if (total <= MAX_PAGE_NUMBERS_VISIBLE) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const half = Math.floor(MAX_PAGE_NUMBERS_VISIBLE / 2);
  let start = Math.max(0, current - half);
  const end = Math.min(total, start + MAX_PAGE_NUMBERS_VISIBLE);
  // 끝쪽에 도달하면 start 를 당겨 항상 N 개 노출
  start = Math.max(0, end - MAX_PAGE_NUMBERS_VISIBLE);
  return Array.from({ length: end - start }, (_, i) => start + i);
};

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildVisiblePages(currentPage, totalPages);
  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;

  return (
    <nav aria-label="페이지 네비게이션" className="flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          type="button"
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page + 1}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="다음 페이지"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
