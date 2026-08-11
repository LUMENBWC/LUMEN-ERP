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

/**
 * Só tem efeito quando NODE_ENV=test (nunca em produção) - os specs e2e de
 * fluxo de negócio (apps/api/test) não têm como emitir um JWT real assinado
 * pelo Supabase pra cada usuário de teste que provisionam, então autenticam
 * via esse header em vez disso. Uma requisição sem esse header segue o
 * caminho normal de verificação de JWT mesmo em teste - é assim que
 * `autenticacao.e2e-spec.ts` continua testando a verificação de JWT de
 * verdade (ver ADR correspondente em docs/decisions).
 */
export const TEST_AUTH_HEADER = 'x-test-auth-user-id';

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

    const authUserId = await this.resolveAuthUserId(request);
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

  private async resolveAuthUserId(request: Request): Promise<string | undefined> {
    if (process.env.NODE_ENV === 'test') {
      const testAuthUserId = request.headers?.[TEST_AUTH_HEADER];
      if (typeof testAuthUserId === 'string' && testAuthUserId) {
        return testAuthUserId;
      }
    }

    const { data: auth, error } = await verifyAuth(toWebRequest(request), { auth: 'user' });
    if (error) {
      return undefined;
    }

    const authData = auth as unknown as {
      user?: { id: string };
      userClaims?: { id?: string; sub?: string };
      jwtClaims?: { sub?: string };
    };
    return (
      authData.user?.id ??
      authData.userClaims?.id ??
      authData.userClaims?.sub ??
      authData.jwtClaims?.sub
    );
  }
}
