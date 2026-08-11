import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarVendasQueryDto } from '../dto/listar-vendas.query.dto';
import {
  VENDAS_REPOSITORY_FACTORY,
  type VendasRepositoryFactory,
} from '../ports/vendas-repository.factory';
import type { ListarVendasResultado } from '../ports/vendas.repository.port';

@Injectable()
export class ListarVendasUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(VENDAS_REPOSITORY_FACTORY) private readonly repoFactory: VendasRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarVendasQueryDto,
  ): Promise<ListarVendasResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar({
        clienteId: query.clienteId,
        status: query.status,
        dataInicio: query.dataInicio,
        dataFim: query.dataFim,
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      });
    });
  }
}
