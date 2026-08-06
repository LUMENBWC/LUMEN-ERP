import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { ProdutoNaoEncontradoError } from '../../domain/produto.errors';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { ProdutoDetalhado } from '../ports/produtos.repository.port';

@Injectable()
export class ObterProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<ProdutoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const produto = await repo.obterPorId(id);
      if (!produto) {
        throw new ProdutoNaoEncontradoError();
      }
      return produto;
    });
  }
}
