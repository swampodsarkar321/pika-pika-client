import { getFreshToken } from './firebase';

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000';

export interface ApiError {
  code: string;
  message: string;
}

async function doFetch<T>(path: string, token: string | null | undefined, method: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((data?.error?.message as string) || `Request failed (${res.status})`);
    err.code = data?.error?.code ?? 'REQUEST_FAILED';
    err.status = res.status;
    err.details = data?.error;
    throw err;
  }
  return data as T;
}

export async function api<T>(path: string, opts: { method?: string; token?: string | null; body?: unknown } = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  try {
    return await doFetch<T>(path, opts.token, method, opts.body);
  } catch (e: any) {
    // On 401, fetch a fresh token straight from the Firebase session and retry once.
    // This heals expired tokens AND cases where React state holds a stale/null token.
    if (e?.status === 401) {
      const fresh = await getFreshToken(true);
      if (fresh && fresh !== opts.token) {
        return await doFetch<T>(path, fresh, method, opts.body);
      }
    }
    throw e;
  }
}
