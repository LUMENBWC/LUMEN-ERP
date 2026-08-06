import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { FornecedorNaoEncontradoError } from '../../domain/fornecedor.errors';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';
import type { FornecedorDetalhado } from '../ports/fornecedores.repository.port';

@Injectable()
export class ObterFornecedorUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<FornecedorDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const fornecedor = await repo.obterPorId(id);
      if (!fornecedor) {
        throw new FornecedorNaoEncontradoError();
      }
      return fornecedor;
    });
  }
}
