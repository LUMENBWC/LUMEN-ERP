import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CaixaSessaoNaoEncontradaError } from '../../domain/caixa.errors';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../ports/caixa-repository.factory';
import type { CaixaSessaoDetalhada } from '../ports/caixa.repository.port';

@Injectable()
export class ObterSessaoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly repoFactory: CaixaRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<CaixaSessaoDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const sessao = await repo.obterSessaoPorId(id);
      if (!sessao) {
        throw new CaixaSessaoNaoEncontradaError();
      }
      return sessao;
    });
  }
}
