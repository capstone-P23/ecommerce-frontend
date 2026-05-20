'use client';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { Category } from '@/types/api';

type Props = {
  categories: Category[];
  /** 현재 선택된 카테고리 id (null = 전체) */
  selectedId: number | null;
  onSelect: (categoryId: number | null) => void;
};

const ALL_KEY = -1;

export function CategoryFilter({ categories, selectedId, onSelect }: Props) {
  const isActive = (id: number | null) => selectedId === id;

  return (
    <nav aria-label="카테고리" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          buttonVariants({
            variant: isActive(null) ? 'default' : 'outline',
            size: 'sm',
          }),
        )}
        aria-pressed={isActive(null)}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.id ?? ALL_KEY}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            buttonVariants({
              variant: isActive(category.id) ? 'default' : 'outline',
              size: 'sm',
            }),
          )}
          aria-pressed={isActive(category.id)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}
