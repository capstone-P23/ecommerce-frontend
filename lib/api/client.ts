export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public cause?: unknown, // 네트워크 에러 원인 보존
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

  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      0,
      `네트워크 요청 실패: ${API_BASE_URL}${path} — ${err instanceof Error ? err.message : String(err)}`,
      err,
    );
  }

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

  if (envelope && typeof envelope === 'object' && 'data' in envelope) {
    return envelope.data as T;
  }

  return envelope as T;
}
