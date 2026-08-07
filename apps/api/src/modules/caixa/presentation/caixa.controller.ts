import { Body, Controller, Get, Post, UseFilters, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { CurrentTenant } from '../../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../../common/tenant/resolve-tenant-context';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { abrirCaixaSchema, type AbrirCaixaDto } from '../application/dto/abrir-caixa.dto';
import { AbrirCaixaUseCase } from '../application/use-cases/abrir-caixa.use-case';
import { ObterCaixaAbertoUseCase } from '../application/use-cases/obter-caixa-aberto.use-case';
import { CaixaDomainErrorFilter } from './caixa-domain-error.filter';

@ApiTags('caixa')
@Controller('caixa')
@UseFilters(CaixaDomainErrorFilter)
export class CaixaController {
  constructor(
    private readonly abrirCaixa: AbrirCaixaUseCase,
    private readonly obterCaixaAberto: ObterCaixaAbertoUseCase,
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
}
