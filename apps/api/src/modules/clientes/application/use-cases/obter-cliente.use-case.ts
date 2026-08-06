import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { ClienteNaoEncontradoError } from '../../domain/cliente.errors';
import {
  CLIENTES_REPOSITORY_FACTORY,
  type ClientesRepositoryFactory,
} from '../ports/clientes-repository.factory';
import type { ClienteDetalhado } from '../ports/clientes.repository.port';

@Injectable()
export class ObterClienteUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CLIENTES_REPOSITORY_FACTORY) private readonly repoFactory: ClientesRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<ClienteDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const cliente = await repo.obterPorId(id);
      if (!cliente) {
        throw new ClienteNaoEncontradoError();
      }
      return cliente;
    });
  }
}
