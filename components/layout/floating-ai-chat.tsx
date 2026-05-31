'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/format';
import { useAiChat } from '@/lib/queries/ai';
import type { AiChatRecommendation } from '@/types/api';

/**
 * [AI-001] 모든 소비자 페이지 우측 하단 고정 AI 에이전트.
 * Phase 2 는 껍데기만 (Sheet open/close + placeholder).
 * 실제 채팅 / 스트리밍은 Phase 8 에서 구현 (useAIChatStore 연결).
 */
export function FloatingAIChat() {
  const params = useParams<{ storeDomain?: string }>();
  const storeDomain = useMemo(() => {
    if (typeof params?.storeDomain === 'string') return params.storeDomain;
    return 'store';
  }, [params]);

  const sessionKey = 'ai-chat-session-id';
  const createSessionId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `session-${Date.now()}`;
  };
  const getInitialSessionId = () => {
    if (typeof window === 'undefined') return createSessionId();
    const saved = window.localStorage.getItem(sessionKey);
    if (saved) return saved;
    const next = createSessionId();
    window.localStorage.setItem(sessionKey, next);
    return next;
  };

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState<
    AiChatRecommendation[]
  >([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  >([
    {
      id: 'intro',
      role: 'assistant',
      content:
        '안녕하세요! 오늘 상황과 취향을 알려주시면 어울리는 상품을 추천해드릴게요.',
    },
  ]);

  const chat = useAiChat();
  const isSending = chat.isPending;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, open]);

  const appendMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, content },
    ]);
  };

  const handleSend = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    appendMessage('user', trimmed);
    setInput('');
    setRecommendations([]);
    setFollowUps([]);

    try {
      const response = await chat.mutateAsync({ sessionId, message: trimmed });
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(sessionKey, response.sessionId);
        }
      }
      appendMessage('assistant', response.answer);
      setRecommendations(response.recommendations ?? []);
      setFollowUps(response.followUpQuestions ?? []);
    } catch {
      appendMessage(
        'assistant',
        '지금은 응답을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend(input);
  };

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

      <SheetContent
        side="right"
        className="flex w-full flex-col px-6 pb-6 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>AI 어시스턴트</SheetTitle>
          <SheetDescription>
            상품 추천, 비교, Q&amp;A 를 대화형으로 도와드립니다.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground'
                      : 'max-w-[80%] rounded-2xl border border-border bg-muted px-4 py-2 text-sm text-foreground'
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {recommendations.length > 0 && (
            <div className="rounded-2xl border border-border bg-background p-3">
              <div className="text-sm font-semibold">추천 상품</div>
              <div className="mt-3 flex flex-col gap-3">
                {recommendations.map((item) => (
                  <Link
                    key={item.productId}
                    href={`/consumer/${storeDomain}/products/${item.productId}`}
                    className="flex gap-3 rounded-xl border border-border bg-muted/50 p-3 transition hover:bg-muted"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-16 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="text-sm font-semibold text-foreground">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.reason}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {followUps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {followUps.map((question) => (
                <Button
                  key={question}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="sr-only" htmlFor="ai-chat-input">
                AI 챗 입력
              </label>
              <textarea
                id="ai-chat-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="예: 비 오는 날 출근할 때 입을 옷 추천해줘"
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isSending}
            >
              {isSending ? '전송 중' : '전송'}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
