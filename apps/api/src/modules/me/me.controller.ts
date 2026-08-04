import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/resolve-tenant-context';

@ApiTags('me')
@Controller('me')
export class MeController {
  @Get()
  me(@CurrentTenant() tenant: TenantContext) {
    return {
      usuarioId: tenant.usuarioId,
      empresaId: tenant.empresaId,
      filialId: tenant.filialId,
      nome: tenant.nome,
      email: tenant.email,
      papeis: tenant.papeis,
      permissoes: Array.from(tenant.permissoes),
    };
  }
}
