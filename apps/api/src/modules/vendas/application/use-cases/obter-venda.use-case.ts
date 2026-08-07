import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { VendaNaoEncontradaError } from '../../domain/venda.errors';
import {
  VENDAS_REPOSITORY_FACTORY,
  type VendasRepositoryFactory,
} from '../ports/vendas-repository.factory';
import type { VendaDetalhada } from '../ports/vendas.repository.port';

@Injectable()
export class ObterVendaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(VENDAS_REPOSITORY_FACTORY) private readonly repoFactory: VendasRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<VendaDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const venda = await repo.obterPorId(id);
      if (!venda) {
        throw new VendaNaoEncontradaError();
      }
      return venda;
    });
  }
}
