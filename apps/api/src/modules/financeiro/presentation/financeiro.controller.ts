import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { CurrentTenant } from '../../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../../common/tenant/resolve-tenant-context';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import {
  criarCategoriaDespesaSchema,
  type CriarCategoriaDespesaDto,
} from '../application/dto/criar-categoria-despesa.dto';
import {
  criarContaPagarSchema,
  type CriarContaPagarDto,
} from '../application/dto/criar-conta-pagar.dto';
import {
  listarContasPagarQuerySchema,
  type ListarContasPagarQueryDto,
} from '../application/dto/listar-contas-pagar.query.dto';
import {
  listarContasReceberQuerySchema,
  type ListarContasReceberQueryDto,
} from '../application/dto/listar-contas-receber.query.dto';
import {
  registrarPagamentoSchema,
  type RegistrarPagamentoDto,
} from '../application/dto/registrar-pagamento.dto';
import {
  registrarRecebimentoSchema,
  type RegistrarRecebimentoDto,
} from '../application/dto/registrar-recebimento.dto';
import { CancelarContaPagarUseCase } from '../application/use-cases/cancelar-conta-pagar.use-case';
import { CriarCategoriaDespesaUseCase } from '../application/use-cases/criar-categoria-despesa.use-case';
import { CriarContaPagarUseCase } from '../application/use-cases/criar-conta-pagar.use-case';
import { ListarCategoriasDespesaUseCase } from '../application/use-cases/listar-categorias-despesa.use-case';
import { ListarContasPagarUseCase } from '../application/use-cases/listar-contas-pagar.use-case';
import { ListarContasReceberUseCase } from '../application/use-cases/listar-contas-receber.use-case';
import { ObterContaPagarUseCase } from '../application/use-cases/obter-conta-pagar.use-case';
import { ObterContaReceberUseCase } from '../application/use-cases/obter-conta-receber.use-case';
import { RegistrarPagamentoUseCase } from '../application/use-cases/registrar-pagamento.use-case';
import { RegistrarRecebimentoUseCase } from '../application/use-cases/registrar-recebimento.use-case';
import { FinanceiroDomainErrorFilter } from './financeiro-domain-error.filter';

@ApiTags('financeiro')
@Controller('financeiro')
@UseFilters(FinanceiroDomainErrorFilter)
export class FinanceiroController {
  constructor(
    private readonly listarContasReceber: ListarContasReceberUseCase,
    private readonly obterContaReceber: ObterContaReceberUseCase,
    private readonly registrarRecebimento: RegistrarRecebimentoUseCase,
    private readonly criarCategoriaDespesa: CriarCategoriaDespesaUseCase,
    private readonly listarCategoriasDespesa: ListarCategoriasDespesaUseCase,
    private readonly criarContaPagar: CriarContaPagarUseCase,
    private readonly listarContasPagar: ListarContasPagarUseCase,
    private readonly obterContaPagar: ObterContaPagarUseCase,
    private readonly registrarPagamento: RegistrarPagamentoUseCase,
    private readonly cancelarContaPagar: CancelarContaPagarUseCase,
  ) {}

  // --- Contas a receber -----------------------------------------------

  @Get('contas-receber')
  @RequirePermissions('financeiro.ler')
  @UsePipes(new ZodValidationPipe(listarContasReceberQuerySchema))
  listarReceber(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListarContasReceberQueryDto,
  ) {
    return this.listarContasReceber.execute(tenant, query);
  }

  @Get('contas-receber/:id')
  @RequirePermissions('financeiro.ler')
  obterReceber(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterContaReceber.execute(tenant, id);
  }

  @Post('contas-receber/:id/recebimentos')
  @RequirePermissions('financeiro.gerenciar')
  @HttpCode(HttpStatus.OK)
  registrarRecebimentoRoute(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(registrarRecebimentoSchema)) dto: RegistrarRecebimentoDto,
  ) {
    return this.registrarRecebimento.execute(tenant, id, dto);
  }

  // --- Categorias de despesa --------------------------------------------

  @Get('categorias-despesa')
  @RequirePermissions('financeiro.ler')
  listarCategorias(@CurrentTenant() tenant: TenantContext) {
    return this.listarCategoriasDespesa.execute(tenant);
  }

  @Post('categorias-despesa')
  @RequirePermissions('financeiro.gerenciar')
  @UsePipes(new ZodValidationPipe(criarCategoriaDespesaSchema))
  criarCategoria(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarCategoriaDespesaDto) {
    return this.criarCategoriaDespesa.execute(tenant, dto);
  }

  // --- Contas a pagar ------------------------------------------------

  @Get('contas-pagar')
  @RequirePermissions('financeiro.ler')
  @UsePipes(new ZodValidationPipe(listarContasPagarQuerySchema))
  listarPagar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarContasPagarQueryDto) {
    return this.listarContasPagar.execute(tenant, query);
  }

  @Get('contas-pagar/:id')
  @RequirePermissions('financeiro.ler')
  obterPagar(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterContaPagar.execute(tenant, id);
  }

  @Post('contas-pagar')
  @RequirePermissions('financeiro.gerenciar')
  @UsePipes(new ZodValidationPipe(criarContaPagarSchema))
  criarPagar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarContaPagarDto) {
    return this.criarContaPagar.execute(tenant, dto);
  }

  @Post('contas-pagar/:id/pagamentos')
  @RequirePermissions('financeiro.gerenciar')
  @HttpCode(HttpStatus.OK)
  registrarPagamentoRoute(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(registrarPagamentoSchema)) dto: RegistrarPagamentoDto,
  ) {
    return this.registrarPagamento.execute(tenant, id, dto);
  }

  @Post('contas-pagar/:id/cancelar')
  @RequirePermissions('financeiro.gerenciar')
  @HttpCode(HttpStatus.OK)
  cancelarPagar(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.cancelarContaPagar.execute(tenant, id);
  }
}
