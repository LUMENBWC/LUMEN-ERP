import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { TenantContext } from '../tenant/resolve-tenant-context';
import { PERMISSIONS_KEY } from './require-permissions.decorator';

type RequestWithTenant = Request & { tenantContext?: TenantContext };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const tenant = request.tenantContext;
    if (!tenant) {
      throw new ForbiddenException('Contexto de tenant ausente.');
    }

    const missing = required.filter((permissao) => !tenant.permissoes.has(permissao));
    if (missing.length > 0) {
      throw new ForbiddenException(`Permissão ausente: ${missing.join(', ')}`);
    }

    return true;
  }
}
