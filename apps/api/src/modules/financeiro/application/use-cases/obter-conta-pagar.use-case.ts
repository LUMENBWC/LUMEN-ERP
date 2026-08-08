import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { ContaPagarNaoEncontradaError } from '../../domain/financeiro.errors';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';
import type { ContaPagarDetalhada } from '../ports/financeiro.repository.port';

@Injectable()
export class ObterContaPagarUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<ContaPagarDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const conta = await repo.obterContaPagarPorId(id);
      if (!conta) {
        throw new ContaPagarNaoEncontradaError();
      }
      return conta;
    });
  }
}
