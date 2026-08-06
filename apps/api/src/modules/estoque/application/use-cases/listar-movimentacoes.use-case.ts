import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarMovimentacoesQueryDto } from '../dto/listar-movimentacoes.query.dto';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../ports/estoque-repository.factory';
import type { ListarMovimentacoesResultado } from '../ports/estoque.repository.port';

@Injectable()
export class ListarMovimentacoesUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ESTOQUE_REPOSITORY_FACTORY) private readonly repoFactory: EstoqueRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarMovimentacoesQueryDto,
  ): Promise<ListarMovimentacoesResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
