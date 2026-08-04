import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyAuth } from '@supabase/server/core';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { resolveTenantContext, TenantContext } from '../tenant/resolve-tenant-context';
import type { PrismaService } from '../../infra/prisma/prisma.service';

jest.mock('@supabase/server/core', () => ({ verifyAuth: jest.fn() }));
jest.mock('../tenant/resolve-tenant-context', () => ({ resolveTenantContext: jest.fn() }));

const mockedVerifyAuth = verifyAuth as jest.MockedFunction<typeof verifyAuth>;
const mockedResolveTenantContext = resolveTenantContext as jest.MockedFunction<
  typeof resolveTenantContext
>;

function makeContext(isPublic: boolean, request: Record<string, unknown> = { headers: {} }) {
  const reflector = { getAllAndOverride: () => isPublic } as unknown as Reflector;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { reflector, context, request };
}

const tenant: TenantContext = {
  authUserId: 'auth-1',
  usuarioId: 'user-1',
  empresaId: 'empresa-1',
  filialId: null,
  nome: 'Fulano',
  email: 'fulano@example.com',
  papeis: ['ADMINISTRADOR'],
  permissoes: new Set(['usuarios.gerenciar']),
};

describe('SupabaseAuthGuard', () => {
  afterEach(() => jest.clearAllMocks());

  it('allows public routes without verifying credentials', async () => {
    const { reflector, context } = makeContext(true);
    const guard = new SupabaseAuthGuard(reflector, {} as PrismaService);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockedVerifyAuth).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the JWT fails verification', async () => {
    const { reflector, context } = makeContext(false);
    mockedVerifyAuth.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials', status: 401, code: 'INVALID_CREDENTIALS' } as never,
    });
    const guard = new SupabaseAuthGuard(reflector, {} as PrismaService);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException when the JWT is valid but no usuario matches', async () => {
    const { reflector, context } = makeContext(false);
    mockedVerifyAuth.mockResolvedValue({
      data: { authMode: 'user', token: 't', userClaims: { id: 'auth-1' }, jwtClaims: null },
      error: null,
    } as never);
    mockedResolveTenantContext.mockResolvedValue(null);
    const guard = new SupabaseAuthGuard(reflector, {} as PrismaService);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('extracts authUserId from auth.user when userClaims only has sub', async () => {
    const { reflector, context, request } = makeContext(false);
    mockedVerifyAuth.mockResolvedValue({
      data: {
        authMode: 'user',
        token: 't',
        user: { id: 'auth-1' },
        userClaims: { sub: 'auth-1' },
        jwtClaims: null,
      },
      error: null,
    } as never);
    mockedResolveTenantContext.mockResolvedValue(tenant);
    const guard = new SupabaseAuthGuard(reflector, {} as PrismaService);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((request as { tenantContext: TenantContext }).tenantContext).toBe(tenant);
  });

  it('attaches tenantContext to the request and allows the call through', async () => {
    const { reflector, context, request } = makeContext(false);
    mockedVerifyAuth.mockResolvedValue({
      data: { authMode: 'user', token: 't', userClaims: { id: 'auth-1' }, jwtClaims: null },
      error: null,
    } as never);
    mockedResolveTenantContext.mockResolvedValue(tenant);
    const guard = new SupabaseAuthGuard(reflector, {} as PrismaService);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((request as { tenantContext: TenantContext }).tenantContext).toBe(tenant);
  });
});
