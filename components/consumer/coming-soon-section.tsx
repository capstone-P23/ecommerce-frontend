import { Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

/**
 * 백엔드에 아직 endpoint 가 없는 기능 영역의 자리표시.
 * (리뷰 / Q&A / AI 추천 등 — 백엔드 구현 후 실제 컴포넌트로 교체)
 */
type Props = {
  title: string;
  /** 어느 phase 에서 실 구현되는지 */
  plannedPhase: string;
};

export function ComingSoonSection({ title }: Props) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex items-center gap-3 p-4">
        <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">준비 중</p>
        </div>
      </CardContent>
    </Card>
  );
}
