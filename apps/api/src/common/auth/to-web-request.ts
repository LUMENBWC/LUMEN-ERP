import type { Request } from 'express';

/** Adapts an Express request into a standard Web Request for @supabase/server/core. */
export function toWebRequest(req: Request): globalThis.Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  return new globalThis.Request(`http://internal${req.originalUrl ?? req.url}`, { headers });
}
