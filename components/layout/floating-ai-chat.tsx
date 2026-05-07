'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/**
 * [AI-001] 모든 소비자 페이지 우측 하단 고정 AI 에이전트.
 * Phase 2 는 껍데기만 (Sheet open/close + placeholder).
 * 실제 채팅 / 스트리밍은 Phase 8 에서 구현 (useAIChatStore 연결).
 */
export function FloatingAIChat() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="icon-lg"
            className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg"
            aria-label="AI 챗 열기"
          />
        }
      >
        <MessageCircle className="size-6" />
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>AI 어시스턴트</SheetTitle>
          <SheetDescription>
            상품 추천, 비교, Q&amp;A 를 대화형으로 도와드립니다.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          TODO (Phase 8): 채팅 메시지 영역 + 입력창
        </div>
      </SheetContent>
    </Sheet>
  );
}
