import { Body, Controller, Get, Post, Query, UseFilters, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { CurrentTenant } from '../../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../../common/tenant/resolve-tenant-context';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import {
  listarMovimentacoesQuerySchema,
  type ListarMovimentacoesQueryDto,
} from '../application/dto/listar-movimentacoes.query.dto';
import {
  registrarAjusteSchema,
  type RegistrarAjusteDto,
} from '../application/dto/registrar-ajuste.dto';
import {
  registrarEntradaSchema,
  type RegistrarEntradaDto,
} from '../application/dto/registrar-entrada.dto';
import {
  registrarPerdaSchema,
  type RegistrarPerdaDto,
} from '../application/dto/registrar-perda.dto';
import { ListarMovimentacoesUseCase } from '../application/use-cases/listar-movimentacoes.use-case';
import { RegistrarAjusteUseCase } from '../application/use-cases/registrar-ajuste.use-case';
import { RegistrarEntradaUseCase } from '../application/use-cases/registrar-entrada.use-case';
import { RegistrarPerdaUseCase } from '../application/use-cases/registrar-perda.use-case';
import { EstoqueDomainErrorFilter } from './estoque-domain-error.filter';

@ApiTags('estoque')
@Controller('estoque')
@UseFilters(EstoqueDomainErrorFilter)
export class EstoqueController {
  constructor(
    private readonly registrarEntrada: RegistrarEntradaUseCase,
    private readonly registrarAjuste: RegistrarAjusteUseCase,
    private readonly registrarPerda: RegistrarPerdaUseCase,
    private readonly listarMovimentacoes: ListarMovimentacoesUseCase,
  ) {}

  @Post('entradas')
  @RequirePermissions('estoque.ajustar')
  @UsePipes(new ZodValidationPipe(registrarEntradaSchema))
  entrada(@CurrentTenant() tenant: TenantContext, @Body() dto: RegistrarEntradaDto) {
    return this.registrarEntrada.execute(tenant, dto);
  }

  @Post('ajustes')
  @RequirePermissions('estoque.ajustar')
  @UsePipes(new ZodValidationPipe(registrarAjusteSchema))
  ajuste(@CurrentTenant() tenant: TenantContext, @Body() dto: RegistrarAjusteDto) {
    return this.registrarAjuste.execute(tenant, dto);
  }

  @Post('perdas')
  @RequirePermissions('estoque.ajustar')
  @UsePipes(new ZodValidationPipe(registrarPerdaSchema))
  perda(@CurrentTenant() tenant: TenantContext, @Body() dto: RegistrarPerdaDto) {
    return this.registrarPerda.execute(tenant, dto);
  }

  @Get('movimentacoes')
  @RequirePermissions('estoque.ler')
  @UsePipes(new ZodValidationPipe(listarMovimentacoesQuerySchema))
  movimentacoes(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListarMovimentacoesQueryDto,
  ) {
    return this.listarMovimentacoes.execute(tenant, query);
  }
}
