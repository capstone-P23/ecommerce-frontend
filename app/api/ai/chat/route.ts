import { NextResponse, type NextRequest } from 'next/server';
import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────
// 상품 카탈로그 (mock 단계 — 백엔드 연동 시 DB 조회로 교체)
// ─────────────────────────────────────────────────────────────

const PRODUCT_CATALOG = [
  {
    productId: 1,
    name: '오가닉 망고',
    price: 12000,
    imageUrl: 'https://picsum.photos/seed/mango/240/240',
    category: '식품',
    description: '유기농 인증을 받은 달콤한 망고. 비타민 C가 풍부합니다.',
  },
  {
    productId: 2,
    name: '아보카도 6개',
    price: 18900,
    imageUrl: 'https://picsum.photos/seed/avocado/240/240',
    category: '식품',
    description: '잘 익은 아보카도 6개 세트. 샐러드, 과카몰리에 좋습니다.',
  },
  {
    productId: 3,
    name: '에티오피아 예가체프 200g',
    price: 16500,
    imageUrl: 'https://picsum.photos/seed/coffee/240/240',
    category: '음료',
    description: '과일향 풍부한 에티오피아 싱글 오리진 원두.',
  },
  {
    productId: 4,
    name: '핸드드립 세트',
    price: 89000,
    imageUrl: 'https://picsum.photos/seed/dripper/240/240',
    category: '주방용품',
    description: '드리퍼, 서버, 필터 포함 핸드드립 입문 세트.',
  },
  {
    productId: 5,
    name: '유기농 오트밀 1kg',
    price: 9800,
    imageUrl: 'https://picsum.photos/seed/oat/240/240',
    category: '식품',
    description: '식이섬유가 풍부한 유기농 오트밀. 아침 식사나 간식으로 좋습니다.',
  },
];

// ─────────────────────────────────────────────────────────────
// 세션별 대화 기록 (인메모리 — 프로덕션에서는 Redis 등 사용)
// ─────────────────────────────────────────────────────────────

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const sessionStore = new Map<string, ChatMessage[]>();

const MAX_HISTORY_LENGTH = 20;

const SYSTEM_PROMPT = `당신은 한국 이커머스 플랫폼의 AI 쇼핑 어시스턴트입니다.
사용자가 상품에 대한 질문이나 추천을 요청하면, 아래 상품 카탈로그를 참고하여 적절한 상품을 추천해 주세요.

## 상품 카탈로그
${PRODUCT_CATALOG.map(
  (p) => `- [ID:${p.productId}] ${p.name} (${p.category}) — ${p.price.toLocaleString()}원: ${p.description}`
).join('\n')}

## 응답 규칙
1. 사용자의 요구에 맞는 상품을 추천하세요.
2. 추천할 상품이 있으면 반드시 아래 JSON 형식으로 응답의 마지막에 포함하세요:
   <!--RECOMMENDATIONS_START-->
   [{"productId": 1, "reason": "추천 이유"}]
   <!--RECOMMENDATIONS_END-->
3. 추천할 상품이 없으면 RECOMMENDATIONS 블록을 포함하지 마세요.
4. 후속 질문 2개를 아래 형식으로 포함하세요:
   <!--FOLLOWUP_START-->
   ["질문1", "질문2"]
   <!--FOLLOWUP_END-->
5. 친절하고 자연스러운 한국어로 대화하세요.
6. 상품 가격은 원 단위로 표시하세요 (예: 12,000원).
7. RECOMMENDATIONS/FOLLOWUP 블록은 사용자에게 보여지지 않으므로 답변 본문에 자연스럽게 추천 내용을 작성하고, 구조화된 데이터는 블록에 넣으세요.`;

// ─────────────────────────────────────────────────────────────
// POST /api/ai/chat
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };

    const sessionId = body.sessionId || `session-${Date.now()}`;
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: '메시지를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          sessionId,
          answer:
            'AI 서비스가 현재 설정되지 않았습니다. 관리자에게 문의해 주세요.',
          recommendations: [],
          followUpQuestions: ['다른 질문이 있으신가요?'],
        },
        { status: 200 }
      );
    }

    // 세션 히스토리 가져오기 (없으면 초기화)
    if (!sessionStore.has(sessionId)) {
      sessionStore.set(sessionId, [
        { role: 'system', content: SYSTEM_PROMPT },
      ]);
    }

    const history = sessionStore.get(sessionId)!;
    history.push({ role: 'user', content: userMessage });

    // 히스토리 길이 제한 (시스템 프롬프트 유지)
    if (history.length > MAX_HISTORY_LENGTH + 1) {
      const systemMsg = history[0];
      const trimmed = history.slice(-(MAX_HISTORY_LENGTH));
      sessionStore.set(sessionId, [systemMsg, ...trimmed]);
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: sessionStore.get(sessionId)!,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const rawAnswer = completion.choices[0]?.message?.content ?? '';

    // assistant 응답을 히스토리에 추가
    history.push({ role: 'assistant', content: rawAnswer });

    // 구조화된 데이터 파싱
    const recommendations = parseRecommendations(rawAnswer);
    const followUpQuestions = parseFollowUps(rawAnswer);
    const cleanAnswer = cleanResponse(rawAnswer);

    return NextResponse.json({
      sessionId,
      answer: cleanAnswer,
      recommendations,
      followUpQuestions,
    });
  } catch (error) {
    console.error('[AI Chat Error]', error);

    const isRateLimit =
      error instanceof Error && error.message.includes('429');
    const message = isRateLimit
      ? '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
      : 'AI 응답 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

    return NextResponse.json(
      {
        sessionId: '',
        answer: message,
        recommendations: [],
        followUpQuestions: ['다시 질문해 주세요.'],
      },
      { status: 200 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 파싱 유틸리티
// ─────────────────────────────────────────────────────────────

function parseRecommendations(
  text: string
): Array<{ productId: number; name: string; price: number; imageUrl: string; reason: string }> {
  const match = text.match(
    /<!--RECOMMENDATIONS_START-->\s*([\s\S]*?)\s*<!--RECOMMENDATIONS_END-->/
  );
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1]) as Array<{
      productId: number;
      reason: string;
    }>;

    return parsed
      .map((rec) => {
        const product = PRODUCT_CATALOG.find(
          (p) => p.productId === rec.productId
        );
        if (!product) return null;
        return {
          productId: product.productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          reason: rec.reason,
        };
      })
      .filter(
        (item): item is NonNullable<typeof item> => item !== null
      );
  } catch {
    return [];
  }
}

function parseFollowUps(text: string): string[] {
  const match = text.match(
    /<!--FOLLOWUP_START-->\s*([\s\S]*?)\s*<!--FOLLOWUP_END-->/
  );
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      return parsed.filter((q): q is string => typeof q === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function cleanResponse(text: string): string {
  return text
    .replace(
      /<!--RECOMMENDATIONS_START-->[\s\S]*?<!--RECOMMENDATIONS_END-->/g,
      ''
    )
    .replace(
      /<!--FOLLOWUP_START-->[\s\S]*?<!--FOLLOWUP_END-->/g,
      ''
    )
    .trim();
}
