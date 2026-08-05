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
import { atribuirPapelSchema } from '../application/dto/atribuir-papel.dto';
import {
  atualizarUsuarioSchema,
  definirAtivoSchema,
} from '../application/dto/atualizar-usuario.dto';
import { criarUsuarioSchema, type CriarUsuarioDto } from '../application/dto/criar-usuario.dto';
import {
  listarUsuariosQuerySchema,
  type ListarUsuariosQueryDto,
} from '../application/dto/listar-usuarios.query.dto';
import type { AtualizarUsuarioDto } from '../application/dto/atualizar-usuario.dto';
import { AtribuirPapelUseCase } from '../application/use-cases/atribuir-papel.use-case';
import { AtualizarUsuarioUseCase } from '../application/use-cases/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from '../application/use-cases/criar-usuario.use-case';
import { DefinirAtivoUsuarioUseCase } from '../application/use-cases/definir-ativo-usuario.use-case';
import { ListarUsuariosUseCase } from '../application/use-cases/listar-usuarios.use-case';
import { ObterUsuarioUseCase } from '../application/use-cases/obter-usuario.use-case';
import { RemoverPapelUseCase } from '../application/use-cases/remover-papel.use-case';
import { UsuarioDomainErrorFilter } from './usuario-domain-error.filter';

@ApiTags('usuarios')
@Controller('usuarios')
@UseFilters(UsuarioDomainErrorFilter)
export class UsuariosController {
  constructor(
    private readonly criarUsuario: CriarUsuarioUseCase,
    private readonly listarUsuarios: ListarUsuariosUseCase,
    private readonly obterUsuario: ObterUsuarioUseCase,
    private readonly atualizarUsuario: AtualizarUsuarioUseCase,
    private readonly definirAtivoUsuario: DefinirAtivoUsuarioUseCase,
    private readonly atribuirPapel: AtribuirPapelUseCase,
    private readonly removerPapel: RemoverPapelUseCase,
  ) {}

  @Post()
  @RequirePermissions('usuarios.gerenciar')
  @UsePipes(new ZodValidationPipe(criarUsuarioSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarUsuarioDto) {
    return this.criarUsuario.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('usuarios.gerenciar')
  @UsePipes(new ZodValidationPipe(listarUsuariosQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarUsuariosQueryDto) {
    return this.listarUsuarios.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('usuarios.gerenciar')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterUsuario.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('usuarios.gerenciar')
  @UsePipes(new ZodValidationPipe(atualizarUsuarioSchema))
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarUsuarioDto,
  ) {
    return this.atualizarUsuario.execute(tenant, id, dto);
  }

  @Patch(':id/ativo')
  @RequirePermissions('usuarios.gerenciar')
  @UsePipes(new ZodValidationPipe(definirAtivoSchema))
  definirAtivo(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { ativo: boolean },
  ) {
    return this.definirAtivoUsuario.execute(tenant, id, dto.ativo);
  }

  @Post(':id/papeis')
  @RequirePermissions('usuarios.gerenciarPermissoes')
  @UsePipes(new ZodValidationPipe(atribuirPapelSchema))
  atribuir(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { papelId: string },
  ) {
    return this.atribuirPapel.execute(tenant, id, dto.papelId);
  }

  @Delete(':id/papeis/:papelId')
  @RequirePermissions('usuarios.gerenciarPermissoes')
  @HttpCode(HttpStatus.OK)
  remover(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('papelId', ParseUUIDPipe) papelId: string,
  ) {
    return this.removerPapel.execute(tenant, id, papelId);
  }
}
