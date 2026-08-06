import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarCategoriasQueryDto } from '../dto/listar-categorias.query.dto';
import {
  CATEGORIAS_REPOSITORY_FACTORY,
  type CategoriasRepositoryFactory,
} from '../ports/categorias-repository.factory';
import type { ListarCategoriasResultado } from '../ports/categorias.repository.port';

@Injectable()
export class ListarCategoriasUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CATEGORIAS_REPOSITORY_FACTORY)
    private readonly repoFactory: CategoriasRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarCategoriasQueryDto,
  ): Promise<ListarCategoriasResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar(query);
    });
  }
}
