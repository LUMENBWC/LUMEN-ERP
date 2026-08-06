import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarProdutosQueryDto } from '../dto/listar-produtos.query.dto';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { ListarProdutosResultado } from '../ports/produtos.repository.port';

@Injectable()
export class ListarProdutosUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarProdutosQueryDto,
  ): Promise<ListarProdutosResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
