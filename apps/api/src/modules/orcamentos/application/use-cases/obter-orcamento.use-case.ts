import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { OrcamentoNaoEncontradoError } from '../../domain/orcamento.errors';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';
import type { OrcamentoDetalhado } from '../ports/orcamentos.repository.port';

@Injectable()
export class ObterOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<OrcamentoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const orcamento = await repo.obterPorId(id);
      if (!orcamento) {
        throw new OrcamentoNaoEncontradoError();
      }
      return orcamento;
    });
  }
}
