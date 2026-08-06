import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarFornecedoresQueryDto } from '../dto/listar-fornecedores.query.dto';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';
import type { ListarFornecedoresResultado } from '../ports/fornecedores.repository.port';

@Injectable()
export class ListarFornecedoresUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarFornecedoresQueryDto,
  ): Promise<ListarFornecedoresResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
