import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import type { TenantContext } from '../tenant/resolve-tenant-context';

function makeContext(tenantContext?: TenantContext): ExecutionContext {
  const request = { tenantContext };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeTenant(permissoes: string[]): TenantContext {
  return {
    authUserId: 'auth-1',
    usuarioId: 'user-1',
    empresaId: 'empresa-1',
    filialId: null,
    nome: 'Fulano',
    email: 'fulano@example.com',
    papeis: ['VENDEDOR'],
    permissoes: new Set(permissoes),
  };
}

describe('PermissionsGuard', () => {
  it('allows the request when no permissions are required', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(makeContext(makeTenant([])))).toBe(true);
  });

  it('allows the request when the tenant has every required permission', () => {
    const reflector = {
      getAllAndOverride: () => ['vendas.criar', 'produtos.ler'],
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    const context = makeContext(makeTenant(['vendas.criar', 'produtos.ler', 'extra.perm']));
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when a required permission is missing', () => {
    const reflector = {
      getAllAndOverride: () => ['vendas.criar', 'produtos.ler'],
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    const context = makeContext(makeTenant(['vendas.criar']));
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when tenantContext is missing entirely', () => {
    const reflector = { getAllAndOverride: () => ['vendas.criar'] } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
