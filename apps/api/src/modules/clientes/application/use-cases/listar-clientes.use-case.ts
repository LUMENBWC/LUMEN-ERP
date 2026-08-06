import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarClientesQueryDto } from '../dto/listar-clientes.query.dto';
import {
  CLIENTES_REPOSITORY_FACTORY,
  type ClientesRepositoryFactory,
} from '../ports/clientes-repository.factory';
import type { ListarClientesResultado } from '../ports/clientes.repository.port';

@Injectable()
export class ListarClientesUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CLIENTES_REPOSITORY_FACTORY) private readonly repoFactory: ClientesRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarClientesQueryDto,
  ): Promise<ListarClientesResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
