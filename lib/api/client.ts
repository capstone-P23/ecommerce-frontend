/**
 * 모든 useQuery / useMutation 이 사용하는 fetch wrapper.
 *
 * - 베이스 URL 자동 prefix (NEXT_PUBLIC_API_BASE_URL)
 * - Bearer 토큰 자동 주입 (authToken 옵션)
 * - { Content-Type: application/json } 기본
 * - body: 객체 → JSON.stringify 자동
 * - 응답 unwrap 안 함 (백엔드가 envelope 사용 안 함)
 * - 에러 시 ApiError throw
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
  authToken?: string | null;
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
): Promise<T> {
  const { authToken, body, headers, ...rest } = init ?? {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const envelope = await res.json();

  // 백엔드가 CommonResponse { status, message, data } 구조를 사용하므로
  // data 필드만 추출하여 반환 (unwrapping).
  // 에러 발생 시에도 envelope.message 를 우선 사용.
  if (envelope && typeof envelope === 'object' && 'data' in envelope) {
    return envelope.data as T;
  }

  return envelope as T;
}
