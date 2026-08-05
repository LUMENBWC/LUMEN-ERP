'use client';

import { createClient } from '../supabase/client';

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL precisa estar definida.');
  }
  return url;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fetch autenticado a partir de Client Components (mutations/queries do TanStack Query). */
async function apiFetchClient(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(`${getApiUrl()}${path}`, { ...init, headers });
}

/** `apiFetchClient` + parse JSON + lança `ApiError` no envelope padrão em caso de erro. */
export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await apiFetchClient(path, { ...init, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      details?: unknown;
    } | null;
    throw new ApiError(
      response.status,
      body?.message ?? 'Erro na requisição.',
      body?.details ?? null,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
