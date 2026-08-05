import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarUsuariosQueryDto } from '../dto/listar-usuarios.query.dto';
import {
  USUARIOS_REPOSITORY_FACTORY,
  type UsuariosRepositoryFactory,
} from '../ports/usuarios-repository.factory';
import type { ListarUsuariosResultado } from '../ports/usuarios.repository.port';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(USUARIOS_REPOSITORY_FACTORY) private readonly repoFactory: UsuariosRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarUsuariosQueryDto,
  ): Promise<ListarUsuariosResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listar({
        busca: query.busca,
        ativo: query.ativo,
        papelId: query.papelId,
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      });
    });
  }
}
