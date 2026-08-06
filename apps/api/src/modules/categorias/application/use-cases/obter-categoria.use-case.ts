import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CategoriaNaoEncontradaError } from '../../domain/categoria.errors';
import {
  CATEGORIAS_REPOSITORY_FACTORY,
  type CategoriasRepositoryFactory,
} from '../ports/categorias-repository.factory';
import type { CategoriaResumo } from '../ports/categorias.repository.port';

@Injectable()
export class ObterCategoriaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CATEGORIAS_REPOSITORY_FACTORY)
    private readonly repoFactory: CategoriasRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<CategoriaResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const categoria = await repo.obterPorId(id);
      if (!categoria) {
        throw new CategoriaNaoEncontradaError();
      }
      return categoria;
    });
  }
}
