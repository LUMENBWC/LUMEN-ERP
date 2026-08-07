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
  finalizarVendaSchema,
  type FinalizarVendaDto,
} from '../application/dto/finalizar-venda.dto';
import {
  listarVendasQuerySchema,
  type ListarVendasQueryDto,
} from '../application/dto/listar-vendas.query.dto';
import { CancelarVendaUseCase } from '../application/use-cases/cancelar-venda.use-case';
import { FinalizarVendaUseCase } from '../application/use-cases/finalizar-venda.use-case';
import { ListarVendasUseCase } from '../application/use-cases/listar-vendas.use-case';
import { ObterVendaUseCase } from '../application/use-cases/obter-venda.use-case';
import { VendaDomainErrorFilter } from './venda-domain-error.filter';

@ApiTags('vendas')
@Controller('vendas')
@UseFilters(VendaDomainErrorFilter)
export class VendasController {
  constructor(
    private readonly finalizarVenda: FinalizarVendaUseCase,
    private readonly listarVendas: ListarVendasUseCase,
    private readonly obterVenda: ObterVendaUseCase,
    private readonly cancelarVenda: CancelarVendaUseCase,
  ) {}

  @Post()
  @RequirePermissions('vendas.criar')
  @UsePipes(new ZodValidationPipe(finalizarVendaSchema))
  finalizar(@CurrentTenant() tenant: TenantContext, @Body() dto: FinalizarVendaDto) {
    return this.finalizarVenda.execute(tenant, dto);
  }

  @Get()
  @RequirePermissions('vendas.criar')
  @UsePipes(new ZodValidationPipe(listarVendasQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarVendasQueryDto) {
    return this.listarVendas.execute(tenant, query);
  }

  @Get(':id')
  @RequirePermissions('vendas.criar')
  obter(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterVenda.execute(tenant, id);
  }

  @Post(':id/cancelar')
  @RequirePermissions('vendas.cancelar')
  @HttpCode(HttpStatus.OK)
  cancelar(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.cancelarVenda.execute(tenant, id);
  }
}
