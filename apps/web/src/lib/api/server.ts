import { createClient } from '../supabase/server';

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL precisa estar definida.');
  }
  return url;
}

/** Fetches from the NestJS API as the currently signed-in user (Server Components/Actions only). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(`${getApiUrl()}${path}`, { ...init, headers, cache: 'no-store' });
}
