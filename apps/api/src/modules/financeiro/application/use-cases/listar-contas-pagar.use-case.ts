import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarContasPagarQueryDto } from '../dto/listar-contas-pagar.query.dto';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';
import type { ListarContasPagarResultado } from '../ports/financeiro.repository.port';

@Injectable()
export class ListarContasPagarUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarContasPagarQueryDto,
  ): Promise<ListarContasPagarResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listarContasPagar(query);
    });
  }
}
