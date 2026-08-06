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
  atualizarCategoriaSchema,
  definirAtivoCategoriaSchema,
} from '../application/dto/atualizar-categoria.dto';
import type { AtualizarCategoriaDto } from '../application/dto/atualizar-categoria.dto';
import {
  criarCategoriaSchema,
  type CriarCategoriaDto,
} from '../application/dto/criar-categoria.dto';
import {
  listarCategoriasQuerySchema,
  type ListarCategoriasQueryDto,
} from '../application/dto/listar-categorias.query.dto';
import { AtualizarCategoriaUseCase } from '../application/use-cases/atualizar-categoria.use-case';
import { CriarCategoriaUseCase } from '../application/use-cases/criar-categoria.use-case';
import { DefinirAtivoCategoriaUseCase } from '../application/use-cases/definir-ativo-categoria.use-case';
import { ListarCategoriasUseCase } from '../application/use-cases/listar-categorias.use-case';
import { ObterCategoriaUseCase } from '../application/use-cases/obter-categoria.use-case';
import { CategoriaDomainErrorFilter } from './categoria-domain-error.filter';

@ApiTags('categorias')
@Controller('categorias')
@UseFilters(CategoriaDomainErrorFilter)
export class CategoriasController {
  constructor(
    private readonly criarCategoria: CriarCategoriaUseCase,
    private readonly listarCategorias: ListarCategoriasUseCase,
    private readonly obterCategoria: ObterCategoriaUseCase,
    private readonly atualizarCategoria: AtualizarCategoriaUseCase,
    private readonly definirAtivoCategoria: DefinirAtivoCategoriaUseCase,
  ) {}

  @Post()
  @RequirePermissions('produtos.gerenciar')
  @UsePipes(new ZodValidationPipe(criarCategoriaSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarCategoriaDto) {
    return this.criarCategoria.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('produtos.ler')
  @UsePipes(new ZodValidationPipe(listarCategoriasQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarCategoriasQueryDto) {
    return this.listarCategorias.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('produtos.ler')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterCategoria.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('produtos.gerenciar')
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(atualizarCategoriaSchema)) dto: AtualizarCategoriaDto,
  ) {
    return this.atualizarCategoria.execute(tenant, id, dto);
  }

  @Patch(':id/ativo')
  @RequirePermissions('produtos.gerenciar')
  definirAtivo(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(definirAtivoCategoriaSchema)) dto: { ativo: boolean },
  ) {
    return this.definirAtivoCategoria.execute(tenant, id, dto.ativo);
  }
}
