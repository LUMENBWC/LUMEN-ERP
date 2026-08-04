import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyAuth } from '@supabase/server/core';
import type { Request } from 'express';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { resolveTenantContext, TenantContext } from '../tenant/resolve-tenant-context';
import { IS_PUBLIC_KEY } from './public.decorator';
import { toWebRequest } from './to-web-request';

type RequestWithTenant = Request & { tenantContext: TenantContext };

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    const { data: auth, error } = await verifyAuth(toWebRequest(request), { auth: 'user' });
    if (error) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const authData = auth as unknown as {
      user?: { id: string };
      userClaims?: { id?: string; sub?: string };
      jwtClaims?: { sub?: string };
    };
    const authUserId =
      authData.user?.id ??
      authData.userClaims?.id ??
      authData.userClaims?.sub ??
      authData.jwtClaims?.sub;

    if (!authUserId) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const tenant = await resolveTenantContext(this.prisma, authUserId);
    if (!tenant) {
      throw new ForbiddenException('Usuário não encontrado ou inativo.');
    }

    request.tenantContext = tenant;
    return true;
  }
}
