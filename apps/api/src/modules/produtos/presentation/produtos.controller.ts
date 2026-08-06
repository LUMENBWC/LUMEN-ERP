import {
  Body,
  Controller,
  Get,
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
  atualizarProdutoSchema,
  definirAtivoProdutoSchema,
} from '../application/dto/atualizar-produto.dto';
import type { AtualizarProdutoDto } from '../application/dto/atualizar-produto.dto';
import { criarProdutoSchema, type CriarProdutoDto } from '../application/dto/criar-produto.dto';
import {
  listarProdutosQuerySchema,
  type ListarProdutosQueryDto,
} from '../application/dto/listar-produtos.query.dto';
import { AtualizarProdutoUseCase } from '../application/use-cases/atualizar-produto.use-case';
import { CriarProdutoUseCase } from '../application/use-cases/criar-produto.use-case';
import { DefinirAtivoProdutoUseCase } from '../application/use-cases/definir-ativo-produto.use-case';
import { ListarAbaixoDoMinimoUseCase } from '../application/use-cases/listar-abaixo-do-minimo.use-case';
import { ListarProdutosUseCase } from '../application/use-cases/listar-produtos.use-case';
import { ObterProdutoUseCase } from '../application/use-cases/obter-produto.use-case';
import { ProdutoDomainErrorFilter } from './produto-domain-error.filter';

@ApiTags('produtos')
@Controller('produtos')
@UseFilters(ProdutoDomainErrorFilter)
export class ProdutosController {
  constructor(
    private readonly criarProduto: CriarProdutoUseCase,
    private readonly listarProdutos: ListarProdutosUseCase,
    private readonly obterProduto: ObterProdutoUseCase,
    private readonly atualizarProduto: AtualizarProdutoUseCase,
    private readonly definirAtivoProduto: DefinirAtivoProdutoUseCase,
    private readonly listarAbaixoDoMinimo: ListarAbaixoDoMinimoUseCase,
  ) {}

  @Post()
  @RequirePermissions('produtos.gerenciar')
  @UsePipes(new ZodValidationPipe(criarProdutoSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarProdutoDto) {
    return this.criarProduto.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('produtos.ler')
  @UsePipes(new ZodValidationPipe(listarProdutosQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarProdutosQueryDto) {
    return this.listarProdutos.execute(tenant, query);
  }

  @Get('alertas/estoque-minimo')
  @RequirePermissions('produtos.ler')
  alertasEstoqueMinimo(@CurrentTenant() tenant: TenantContext) {
    return this.listarAbaixoDoMinimo.execute(tenant);
  }

  @Get(':id')
  @RequirePermissions('produtos.ler')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterProduto.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('produtos.gerenciar')
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(atualizarProdutoSchema)) dto: AtualizarProdutoDto,
  ) {
    return this.atualizarProduto.execute(tenant, id, dto);
  }

  @Patch(':id/ativo')
  @RequirePermissions('produtos.gerenciar')
  definirAtivo(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(definirAtivoProdutoSchema)) dto: { ativo: boolean },
  ) {
    return this.definirAtivoProduto.execute(tenant, id, dto.ativo);
  }
}
