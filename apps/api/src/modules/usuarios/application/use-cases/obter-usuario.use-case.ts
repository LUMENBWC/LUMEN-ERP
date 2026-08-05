import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { UsuarioNaoEncontradoError } from '../../domain/usuario.errors';
import {
  USUARIOS_REPOSITORY_FACTORY,
  type UsuariosRepositoryFactory,
} from '../ports/usuarios-repository.factory';
import type { UsuarioDetalhado } from '../ports/usuarios.repository.port';

@Injectable()
export class ObterUsuarioUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(USUARIOS_REPOSITORY_FACTORY) private readonly repoFactory: UsuariosRepositoryFactory,
  ) {}

  async execute(tenant: TenantContext, usuarioId: string): Promise<UsuarioDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const usuario = await repo.obterPorId(usuarioId);
      if (!usuario) {
        throw new UsuarioNaoEncontradoError();
      }
      return usuario;
    });
  }
}
