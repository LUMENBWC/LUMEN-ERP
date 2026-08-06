import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { ProdutoResumo } from '../ports/produtos.repository.port';

/** Spec Secao 3.1: "Estoque mínimo: sinalizar produtos abaixo do mínimo (flag + endpoint de alerta)". */
@Injectable()
export class ListarAbaixoDoMinimoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext): Promise<ProdutoResumo[]> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listarAbaixoDoMinimo();
    });
  }
}
