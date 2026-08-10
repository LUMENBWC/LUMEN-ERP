import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { resolverPeriodo } from '../../domain/resolver-periodo';
import type { ProdutosMaisVendidosQueryDto } from '../dto/produtos-mais-vendidos.query.dto';
import {
  DASHBOARD_REPOSITORY_FACTORY,
  type DashboardRepositoryFactory,
} from '../ports/dashboard-repository.factory';
import type { ProdutoMaisVendidoResumo } from '../ports/dashboard.repository.port';

export interface ProdutosMaisVendidosResultado {
  periodo: { inicio: Date; fim: Date };
  porQuantidade: ProdutoMaisVendidoResumo[];
  porValor: ProdutoMaisVendidoResumo[];
}

@Injectable()
export class ObterProdutosMaisVendidosUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(DASHBOARD_REPOSITORY_FACTORY) private readonly repoFactory: DashboardRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ProdutosMaisVendidosQueryDto,
  ): Promise<ProdutosMaisVendidosResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const periodo = resolverPeriodo(query.dataInicio, query.dataFim, new Date());

      const resultado = await repo.obterProdutosMaisVendidos(
        periodo.inicio,
        periodo.fim,
        query.limit,
      );

      return { periodo, ...resultado };
    });
  }
}
