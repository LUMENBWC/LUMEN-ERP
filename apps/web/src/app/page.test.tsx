import { describe, expect, it, vi } from 'vitest';

const redirectMock = vi.hoisted(() => vi.fn());
const getUserMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ redirect: redirectMock }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: getUserMock } }),
}));

describe('Home', () => {
  it('redireciona para /login quando não há usuário autenticado', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { default: Home } = await import('./page');

    await Home();

    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('redireciona para /dashboard quando há usuário autenticado', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'auth-1' } } });
    const { default: Home } = await import('./page');

    await Home();

    expect(redirectMock).toHaveBeenCalledWith('/dashboard');
  });
});
