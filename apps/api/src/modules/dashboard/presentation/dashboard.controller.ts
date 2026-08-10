import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { CurrentTenant } from '../../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../../common/tenant/resolve-tenant-context';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { periodoQuerySchema, type PeriodoQueryDto } from '../application/dto/periodo.query.dto';
import {
  produtosMaisVendidosQuerySchema,
  type ProdutosMaisVendidosQueryDto,
} from '../application/dto/produtos-mais-vendidos.query.dto';
import { ObterFluxoCaixaUseCase } from '../application/use-cases/obter-fluxo-caixa.use-case';
import { ObterProdutosMaisVendidosUseCase } from '../application/use-cases/obter-produtos-mais-vendidos.use-case';
import { ObterResumoFinanceiroUseCase } from '../application/use-cases/obter-resumo-financeiro.use-case';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly obterResumoFinanceiro: ObterResumoFinanceiroUseCase,
    private readonly obterProdutosMaisVendidos: ObterProdutosMaisVendidosUseCase,
    private readonly obterFluxoCaixa: ObterFluxoCaixaUseCase,
  ) {}

  @Get('resumo')
  @RequirePermissions('financeiro.ler')
  @UsePipes(new ZodValidationPipe(periodoQuerySchema))
  resumo(@CurrentTenant() tenant: TenantContext, @Query() query: PeriodoQueryDto) {
    return this.obterResumoFinanceiro.execute(tenant, query);
  }

  @Get('produtos-mais-vendidos')
  @RequirePermissions('financeiro.ler')
  @UsePipes(new ZodValidationPipe(produtosMaisVendidosQuerySchema))
  produtosMaisVendidos(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ProdutosMaisVendidosQueryDto,
  ) {
    return this.obterProdutosMaisVendidos.execute(tenant, query);
  }

  @Get('fluxo-caixa')
  @RequirePermissions('financeiro.ler')
  @UsePipes(new ZodValidationPipe(periodoQuerySchema))
  fluxoCaixa(@CurrentTenant() tenant: TenantContext, @Query() query: PeriodoQueryDto) {
    return this.obterFluxoCaixa.execute(tenant, query);
  }
}
