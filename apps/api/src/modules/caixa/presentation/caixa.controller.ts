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
import { abrirCaixaSchema, type AbrirCaixaDto } from '../application/dto/abrir-caixa.dto';
import { fecharCaixaSchema, type FecharCaixaDto } from '../application/dto/fechar-caixa.dto';
import {
  listarSessoesQuerySchema,
  type ListarSessoesQueryDto,
} from '../application/dto/listar-sessoes.query.dto';
import { sangriaSchema, type SangriaDto } from '../application/dto/sangria.dto';
import { suprimentoSchema, type SuprimentoDto } from '../application/dto/suprimento.dto';
import { AbrirCaixaUseCase } from '../application/use-cases/abrir-caixa.use-case';
import { FecharCaixaUseCase } from '../application/use-cases/fechar-caixa.use-case';
import { ListarSessoesUseCase } from '../application/use-cases/listar-sessoes.use-case';
import { ObterCaixaAbertoUseCase } from '../application/use-cases/obter-caixa-aberto.use-case';
import { ObterSessaoUseCase } from '../application/use-cases/obter-sessao.use-case';
import { RegistrarSangriaUseCase } from '../application/use-cases/registrar-sangria.use-case';
import { RegistrarSuprimentoUseCase } from '../application/use-cases/registrar-suprimento.use-case';
import { CaixaDomainErrorFilter } from './caixa-domain-error.filter';

@ApiTags('caixa')
@Controller('caixa')
@UseFilters(CaixaDomainErrorFilter)
export class CaixaController {
  constructor(
    private readonly abrirCaixa: AbrirCaixaUseCase,
    private readonly obterCaixaAberto: ObterCaixaAbertoUseCase,
    private readonly registrarSangria: RegistrarSangriaUseCase,
    private readonly registrarSuprimento: RegistrarSuprimentoUseCase,
    private readonly fecharCaixa: FecharCaixaUseCase,
    private readonly listarSessoes: ListarSessoesUseCase,
    private readonly obterSessao: ObterSessaoUseCase,
  ) {}

  @Post('abrir')
  @RequirePermissions('caixa.abrir')
  @UsePipes(new ZodValidationPipe(abrirCaixaSchema))
  abrir(@CurrentTenant() tenant: TenantContext, @Body() dto: AbrirCaixaDto) {
    return this.abrirCaixa.execute(tenant, dto);
  }

  @Get('sessoes/atual')
  @RequirePermissions('vendas.criar')
  async obterAtual(@CurrentTenant() tenant: TenantContext) {
    // Envelopado num objeto de propósito: um handler que retorna `null` faz o
    // Nest/Express responder com corpo vazio (Content-Length: 0), não a
    // string JSON "null" - `response.json()` no cliente quebra em cima disso
    // (SyntaxError: Unexpected end of JSON input). `{ sessao: null }` é
    // sempre um JSON válido, aberto ou não.
    const sessao = await this.obterCaixaAberto.execute(tenant);
    return { sessao };
  }

  @Post('sangria')
  @RequirePermissions('caixa.movimentar')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(sangriaSchema))
  sangria(@CurrentTenant() tenant: TenantContext, @Body() dto: SangriaDto) {
    return this.registrarSangria.execute(tenant, dto);
  }

  @Post('suprimento')
  @RequirePermissions('caixa.movimentar')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(suprimentoSchema))
  suprimento(@CurrentTenant() tenant: TenantContext, @Body() dto: SuprimentoDto) {
    return this.registrarSuprimento.execute(tenant, dto);
  }

  @Post('fechar')
  @RequirePermissions('caixa.fechar')
  @UsePipes(new ZodValidationPipe(fecharCaixaSchema))
  fechar(@CurrentTenant() tenant: TenantContext, @Body() dto: FecharCaixaDto) {
    return this.fecharCaixa.execute(tenant, dto);
  }

  @Get('sessoes')
  @RequirePermissions('caixa.abrir')
  @UsePipes(new ZodValidationPipe(listarSessoesQuerySchema))
  listar(@CurrentTenant() tenant: TenantContext, @Query() query: ListarSessoesQueryDto) {
    return this.listarSessoes.execute(tenant, query);
  }

  @Get('sessoes/:id')
  @RequirePermissions('caixa.abrir')
  obterPorId(@CurrentTenant() tenant: TenantContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.obterSessao.execute(tenant, id);
  }
}
