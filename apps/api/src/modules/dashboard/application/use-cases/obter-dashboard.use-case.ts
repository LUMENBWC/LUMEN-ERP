import { Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { PeriodoQueryDto } from '../dto/periodo.query.dto';
import { ObterFluxoCaixaUseCase, type FluxoCaixaResultado } from './obter-fluxo-caixa.use-case';
import {
  ObterProdutosMaisVendidosUseCase,
  type ProdutosMaisVendidosResultado,
} from './obter-produtos-mais-vendidos.use-case';
import { ObterResumoFinanceiroUseCase } from './obter-resumo-financeiro.use-case';
import type { ResumoFinanceiro } from '../ports/dashboard.repository.port';

export interface DashboardResultado {
  resumo: ResumoFinanceiro;
  produtosMaisVendidos: ProdutosMaisVendidosResultado;
  fluxoCaixa: FluxoCaixaResultado;
}

/** Quantos produtos "mais vendidos" o dashboard exibe por padrão. */
const LIMITE_PRODUTOS_MAIS_VENDIDOS = 10;

/**
 * Agrega, num único endpoint, os três blocos do dashboard financeiro
 * (resumo, produtos mais vendidos e fluxo de caixa). Evita que o cliente
 * faça três round-trips HTTP separados a cada carregamento — os três
 * casos de uso rodam em paralelo aqui no servidor.
 */
@Injectable()
export class ObterDashboardUseCase {
  constructor(
    private readonly obterResumoFinanceiro: ObterResumoFinanceiroUseCase,
    private readonly obterProdutosMaisVendidos: ObterProdutosMaisVendidosUseCase,
    private readonly obterFluxoCaixa: ObterFluxoCaixaUseCase,
  ) {}

  async execute(tenant: TenantContext, query: PeriodoQueryDto): Promise<DashboardResultado> {
    const [resumo, produtosMaisVendidos, fluxoCaixa] = await Promise.all([
      this.obterResumoFinanceiro.execute(tenant, query),
      this.obterProdutosMaisVendidos.execute(tenant, {
        ...query,
        limit: LIMITE_PRODUTOS_MAIS_VENDIDOS,
      }),
      this.obterFluxoCaixa.execute(tenant, query),
    ]);

    return { resumo, produtosMaisVendidos, fluxoCaixa };
  }
}
