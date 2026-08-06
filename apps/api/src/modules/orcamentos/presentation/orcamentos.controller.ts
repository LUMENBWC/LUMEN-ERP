import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
  atualizarStatusOrcamentoSchema,
  type AtualizarStatusOrcamentoDto,
} from '../application/dto/atualizar-status-orcamento.dto';
import {
  criarOrcamentoSchema,
  type CriarOrcamentoDto,
} from '../application/dto/criar-orcamento.dto';
import {
  listarOrcamentosQuerySchema,
  type ListarOrcamentosQueryDto,
} from '../application/dto/listar-orcamentos.query.dto';
import { AtualizarOrcamentoUseCase } from '../application/use-cases/atualizar-orcamento.use-case';
import { AtualizarStatusOrcamentoUseCase } from '../application/use-cases/atualizar-status-orcamento.use-case';
import { CancelarOrcamentoUseCase } from '../application/use-cases/cancelar-orcamento.use-case';
import { CriarOrcamentoUseCase } from '../application/use-cases/criar-orcamento.use-case';
import { GerarPdfOrcamentoUseCase } from '../application/use-cases/gerar-pdf-orcamento.use-case';
import { ListarOrcamentosUseCase } from '../application/use-cases/listar-orcamentos.use-case';
import { ObterOrcamentoUseCase } from '../application/use-cases/obter-orcamento.use-case';
import { OrcamentoDomainErrorFilter } from './orcamento-domain-error.filter';

@ApiTags('orcamentos')
@Controller('orcamentos')
@UseFilters(OrcamentoDomainErrorFilter)
export class OrcamentosController {
  constructor(
    private readonly criarOrcamento: CriarOrcamentoUseCase,
    private readonly listarOrcamentos: ListarOrcamentosUseCase,
    private readonly obterOrcamento: ObterOrcamentoUseCase,
    private readonly atualizarOrcamento: AtualizarOrcamentoUseCase,
    private readonly atualizarStatusOrcamento: AtualizarStatusOrcamentoUseCase,
    private readonly cancelarOrcamento: CancelarOrcamentoUseCase,
    private readonly gerarPdfOrcamento: GerarPdfOrcamentoUseCase,
  ) {}

  @Post()
  @RequirePermissions('orcamentos.gerenciar')
  @UsePipes(new ZodValidationPipe(criarOrcamentoSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarOrcamentoDto) {
    return this.criarOrcamento.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('orcamentos.ler')
  @UsePipes(new ZodValidationPipe(listarOrcamentosQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarOrcamentosQueryDto) {
    return this.listarOrcamentos.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('orcamentos.ler')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterOrcamento.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('orcamentos.gerenciar')
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
  ) {
    return this.atualizarOrcamento.execute(tenant, id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('orcamentos.gerenciar')
  atualizarStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(atualizarStatusOrcamentoSchema)) dto: AtualizarStatusOrcamentoDto,
  ) {
    return this.atualizarStatusOrcamento.execute(tenant, id, dto);
  }

  @Post(':id/cancelar')
  @RequirePermissions('orcamentos.gerenciar')
  @HttpCode(HttpStatus.OK)
  cancelar(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.cancelarOrcamento.execute(tenant, id);
  }

  @Post(':id/pdf')
  @RequirePermissions('orcamentos.ler')
  @HttpCode(HttpStatus.OK)
  gerarPdf(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.gerarPdfOrcamento.execute(tenant, id);
  }
}
