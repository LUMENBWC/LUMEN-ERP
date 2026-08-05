import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { garantirNaoRemoveUltimoAdministrador } from '../../domain/garantir-nao-remove-ultimo-administrador';
import { PAPEL_ADMINISTRADOR } from '../../domain/papel-administrador';
import {
  PapelNaoEncontradoError,
  UsuarioNaoEncontradoError,
  UsuarioNaoTemPapelError,
} from '../../domain/usuario.errors';
import {
  USUARIOS_REPOSITORY_FACTORY,
  type UsuariosRepositoryFactory,
} from '../ports/usuarios-repository.factory';
import type { UsuarioDetalhado } from '../ports/usuarios.repository.port';

@Injectable()
export class RemoverPapelUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(USUARIOS_REPOSITORY_FACTORY) private readonly repoFactory: UsuariosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    usuarioId: string,
    papelId: string,
  ): Promise<UsuarioDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const [usuario, papel, tem] = await Promise.all([
        repo.obterPorId(usuarioId),
        repo.obterPapelPorId(papelId),
        repo.usuarioTemPapel(usuarioId, papelId),
      ]);

      if (!usuario) {
        throw new UsuarioNaoEncontradoError();
      }
      if (!papel) {
        throw new PapelNaoEncontradoError();
      }
      if (!tem) {
        throw new UsuarioNaoTemPapelError();
      }

      if (papel.nome === PAPEL_ADMINISTRADOR && usuario.ativo) {
        const totalOutros = await repo.contarAdministradoresAtivos(usuarioId);
        garantirNaoRemoveUltimoAdministrador(true, totalOutros);
      }

      await repo.removerPapel(usuarioId, papelId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Usuario',
        entidadeId: usuarioId,
        acao: 'REMOVER_PAPEL',
        dadosAntes: { papelId, papelNome: papel.nome },
      });

      return (await repo.obterPorId(usuarioId)) as UsuarioDetalhado;
    });
  }
}
