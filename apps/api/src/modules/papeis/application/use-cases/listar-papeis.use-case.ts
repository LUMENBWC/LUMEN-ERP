import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  PAPEIS_REPOSITORY_FACTORY,
  type PapeisRepositoryFactory,
} from '../ports/papeis-repository.factory';
import type { PapelComPermissoes } from '../ports/papeis.repository.port';

@Injectable()
export class ListarPapeisUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PAPEIS_REPOSITORY_FACTORY) private readonly repoFactory: PapeisRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext): Promise<PapelComPermissoes[]> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx);
      return repo.listarPapeisDaEmpresa();
    });
  }
}
