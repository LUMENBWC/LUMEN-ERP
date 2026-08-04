import type { Request } from 'express';
import { toWebRequest } from './to-web-request';

describe('toWebRequest', () => {
  it('carries the Authorization header over to the Web Request', () => {
    const req = {
      headers: { authorization: 'Bearer abc.def.ghi', 'content-type': 'application/json' },
      originalUrl: '/api/v1/me',
    } as unknown as Request;

    const webRequest = toWebRequest(req);

    expect(webRequest.headers.get('authorization')).toBe('Bearer abc.def.ghi');
    expect(webRequest.headers.get('content-type')).toBe('application/json');
    expect(webRequest.url).toBe('http://internal/api/v1/me');
  });

  it('skips undefined header values without throwing', () => {
    const req = {
      headers: { authorization: undefined, apikey: 'sb_publishable_x' },
      originalUrl: '/api/v1/produtos',
    } as unknown as Request;

    const webRequest = toWebRequest(req);

    expect(webRequest.headers.get('authorization')).toBeNull();
    expect(webRequest.headers.get('apikey')).toBe('sb_publishable_x');
  });
});
