import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarOrcamentosQueryDto } from '../dto/listar-orcamentos.query.dto';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';
import type { ListarOrcamentosResultado } from '../ports/orcamentos.repository.port';

@Injectable()
export class ListarOrcamentosUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarOrcamentosQueryDto,
  ): Promise<ListarOrcamentosResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
