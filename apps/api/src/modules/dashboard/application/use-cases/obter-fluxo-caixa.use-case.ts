import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularFluxoCaixa, type FluxoCaixa } from '../../domain/calcular-fluxo-caixa';
import { resolverPeriodo } from '../../domain/resolver-periodo';
import type { PeriodoQueryDto } from '../dto/periodo.query.dto';
import {
  DASHBOARD_REPOSITORY_FACTORY,
  type DashboardRepositoryFactory,
} from '../ports/dashboard-repository.factory';

export interface FluxoCaixaResultado extends FluxoCaixa {
  periodo: { inicio: Date; fim: Date };
}

@Injectable()
export class ObterFluxoCaixaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(DASHBOARD_REPOSITORY_FACTORY) private readonly repoFactory: DashboardRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, query: PeriodoQueryDto): Promise<FluxoCaixaResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const periodo = resolverPeriodo(query.dataInicio, query.dataFim, new Date());

      const { entradas, saidas } = await repo.obterEntradasESaidasCaixa(
        periodo.inicio,
        periodo.fim,
      );
      const fluxo = calcularFluxoCaixa(entradas, saidas);

      return { periodo, ...fluxo };
    });
  }
}
