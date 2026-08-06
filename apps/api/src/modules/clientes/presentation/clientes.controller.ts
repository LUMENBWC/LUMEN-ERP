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
  atualizarClienteSchema,
  definirAtivoClienteSchema,
} from '../application/dto/atualizar-cliente.dto';
import type { AtualizarClienteDto } from '../application/dto/atualizar-cliente.dto';
import { criarClienteSchema, type CriarClienteDto } from '../application/dto/criar-cliente.dto';
import {
  listarClientesQuerySchema,
  type ListarClientesQueryDto,
} from '../application/dto/listar-clientes.query.dto';
import { AtualizarClienteUseCase } from '../application/use-cases/atualizar-cliente.use-case';
import { CriarClienteUseCase } from '../application/use-cases/criar-cliente.use-case';
import { DefinirAtivoClienteUseCase } from '../application/use-cases/definir-ativo-cliente.use-case';
import { ListarClientesUseCase } from '../application/use-cases/listar-clientes.use-case';
import { ObterClienteUseCase } from '../application/use-cases/obter-cliente.use-case';
import { ClienteDomainErrorFilter } from './cliente-domain-error.filter';

@ApiTags('clientes')
@Controller('clientes')
@UseFilters(ClienteDomainErrorFilter)
export class ClientesController {
  constructor(
    private readonly criarCliente: CriarClienteUseCase,
    private readonly listarClientes: ListarClientesUseCase,
    private readonly obterCliente: ObterClienteUseCase,
    private readonly atualizarCliente: AtualizarClienteUseCase,
    private readonly definirAtivoCliente: DefinirAtivoClienteUseCase,
  ) {}

  @Post()
  @RequirePermissions('clientes.gerenciar')
  @UsePipes(new ZodValidationPipe(criarClienteSchema))
  criar(@CurrentTenant() tenant: TenantContext, @Body() dto: CriarClienteDto) {
    return this.criarCliente.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('clientes.ler')
  @UsePipes(new ZodValidationPipe(listarClientesQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarClientesQueryDto) {
    return this.listarClientes.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('clientes.ler')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterCliente.execute(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('clientes.gerenciar')
  atualizar(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(atualizarClienteSchema)) dto: AtualizarClienteDto,
  ) {
    return this.atualizarCliente.execute(tenant, id, dto);
  }

  @Patch(':id/ativo')
  @RequirePermissions('clientes.gerenciar')
  definirAtivo(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(definirAtivoClienteSchema)) dto: { ativo: boolean },
  ) {
    return this.definirAtivoCliente.execute(tenant, id, dto.ativo);
  }
}
