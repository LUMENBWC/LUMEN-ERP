import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { ContaReceberNaoEncontradaError } from '../../domain/financeiro.errors';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';
import type { ContaReceberDetalhada } from '../ports/financeiro.repository.port';

@Injectable()
export class ObterContaReceberUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<ContaReceberDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const conta = await repo.obterContaReceberPorId(id);
      if (!conta) {
        throw new ContaReceberNaoEncontradaError();
      }
      return conta;
    });
  }
}
