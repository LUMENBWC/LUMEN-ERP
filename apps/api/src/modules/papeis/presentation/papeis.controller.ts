import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { CurrentTenant } from '../../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../../common/tenant/resolve-tenant-context';
import { ListarPapeisUseCase } from '../application/use-cases/listar-papeis.use-case';
import { ListarPermissoesUseCase } from '../application/use-cases/listar-permissoes.use-case';

@ApiTags('papeis')
@Controller()
export class PapeisController {
  constructor(
    private readonly listarPapeis: ListarPapeisUseCase,
    private readonly listarPermissoes: ListarPermissoesUseCase,
  ) {}

  @Get('papeis')
  @RequirePermissions('usuarios.gerenciar')
  papeis(@CurrentTenant() tenant: TenantContext) {
    return this.listarPapeis.execute(tenant);
  }

  @Get('permissoes')
  @RequirePermissions('usuarios.gerenciar')
  permissoes() {
    return this.listarPermissoes.execute();
  }
}
