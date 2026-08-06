import {
  Body,
  Controller,
  Delete,
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
  atualizarFornecedorSchema,
  definirAtivoFornecedorSchema,
} from '../application/dto/atualizar-fornecedor.dto';
import type { AtualizarFornecedorDto } from '../application/dto/atualizar-fornecedor.dto';
import {
  criarFornecedorSchema,
  type CriarFornecedorDto,
} from '../application/dto/criar-fornecedor.dto';
import {
  listarFornecedoresQuerySchema,
  type ListarFornecedoresQueryDto,
} from '../application/dto/listar-fornecedores.query.dto';
import {
  vincularProdutoSchema,
  type VincularProdutoDto,
} from '../application/dto/vincular-produto.dto';
import { AtualizarFornecedorUseCase } from '../application/use-cases/atualizar-fornecedor.use-case';
import { CriarFornecedorUseCase } from '../application/use-cases/criar-fornecedor.use-case';
import { DefinirAtivoFornecedorUseCase } from '../application/use-cases/definir-ativo-fornecedor.use-case';
import { DesvincularProdutoUseCase } from '../application/use-cases/desvincular-produto.use-case';
import { ListarFornecedoresUseCase } from '../application/use-cases/listar-fornecedores.use-case';
import { ObterFornecedorUseCase } from '../application/use-cases/obter-fornecedor.use-case';
import { VincularProdutoUseCase } from '../application/use-cases/vincular-produto.use-case';
import { FornecedorDomainErrorFilter } from './fornecedor-domain-error.filter';

@ApiTags('fornecedores')
@Controller('fornecedores')
@UseFilters(FornecedorDomainErrorFilter)
export class FornecedoresController {
  constructor(
    private readonly criarFornecedor: CriarFornecedorUseCase,
    private readonly listarFornecedores: ListarFornecedoresUseCase,
    private readonly obterFornecedor: ObterFornecedorUseCase,
    private readonly atualizarFornecedor: AtualizarFornecedorUseCase,
    private readonly definirAtivoFornecedor: DefinirAtivoFornecedorUseCase,
    private readonly vincularProduto: VincularProdutoUseCase,
    private readonly desvincularProduto: DesvincularProdutoUseCase,
  ) {}

  @Post()
  @RequirePermissions('fornecedores.gerenciar')
  @UsePipes(new ZodValidationPipe(criarFornecedorSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarFornecedorDto) {
    return this.criarFornecedor.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('fornecedores.ler')
  @UsePipes(new ZodValidationPipe(listarFornecedoresQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarFornecedoresQueryDto) {
    return this.listarFornecedores.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('fornecedores.ler')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterFornecedor.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('fornecedores.gerenciar')
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(atualizarFornecedorSchema)) dto: AtualizarFornecedorDto,
  ) {
    return this.atualizarFornecedor.execute(tenant, id, dto);
  }

  @Patch(':id/ativo')
  @RequirePermissions('fornecedores.gerenciar')
  definirAtivo(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(definirAtivoFornecedorSchema)) dto: { ativo: boolean },
  ) {
    return this.definirAtivoFornecedor.execute(tenant, id, dto.ativo);
  }

  @Post(':id/produtos')
  @RequirePermissions('fornecedores.gerenciar')
  vincular(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(vincularProdutoSchema)) dto: VincularProdutoDto,
  ) {
    return this.vincularProduto.execute(tenant, id, dto.produtoId);
  }

  @Delete(':id/produtos/:produtoId')
  @RequirePermissions('fornecedores.gerenciar')
  @HttpCode(HttpStatus.OK)
  desvincular(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('produtoId', ParseUUIDPipe) produtoId: string,
  ) {
    return this.desvincularProduto.execute(tenant, id, produtoId);
  }
}
