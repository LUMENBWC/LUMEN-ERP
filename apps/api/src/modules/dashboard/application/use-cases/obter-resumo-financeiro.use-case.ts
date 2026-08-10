import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularLucro } from '../../domain/calcular-lucro';
import { resolverPeriodo } from '../../domain/resolver-periodo';
import type { PeriodoQueryDto } from '../dto/periodo.query.dto';
import {
  DASHBOARD_REPOSITORY_FACTORY,
  type DashboardRepositoryFactory,
} from '../ports/dashboard-repository.factory';
import type { ResumoFinanceiro } from '../ports/dashboard.repository.port';

@Injectable()
export class ObterResumoFinanceiroUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(DASHBOARD_REPOSITORY_FACTORY) private readonly repoFactory: DashboardRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, query: PeriodoQueryDto): Promise<ResumoFinanceiro> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const periodo = resolverPeriodo(query.dataInicio, query.dataFim, new Date());

      const [faturamentoECusto, despesasPagas, receber, pagar] = await Promise.all([
        repo.obterFaturamentoECusto(periodo.inicio, periodo.fim),
        repo.obterDespesasPagas(periodo.inicio, periodo.fim),
        repo.obterTotalEAgingReceber(new Date()),
        repo.obterTotalEAgingPagar(new Date()),
      ]);

      const lucro = calcularLucro(
        faturamentoECusto.faturamento,
        faturamentoECusto.custoProdutosVendidos,
        despesasPagas,
      );

      return {
        periodo,
        faturamento: faturamentoECusto.faturamento,
        custoProdutosVendidos: faturamentoECusto.custoProdutosVendidos,
        quantidadeVendas: faturamentoECusto.quantidadeVendas,
        despesasPagas,
        lucro,
        totalAReceber: receber.total,
        agingReceber: receber.aging,
        totalAPagar: pagar.total,
        agingPagar: pagar.aging,
      };
    });
  }
}
