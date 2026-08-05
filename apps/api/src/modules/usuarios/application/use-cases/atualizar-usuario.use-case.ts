import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { EmailJaCadastradoError, UsuarioNaoEncontradoError } from '../../domain/usuario.errors';
import type { AtualizarUsuarioDto } from '../dto/atualizar-usuario.dto';
import {
  USUARIOS_REPOSITORY_FACTORY,
  type UsuariosRepositoryFactory,
} from '../ports/usuarios-repository.factory';
import type { UsuarioDetalhado } from '../ports/usuarios.repository.port';

@Injectable()
export class AtualizarUsuarioUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(USUARIOS_REPOSITORY_FACTORY) private readonly repoFactory: UsuariosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    usuarioId: string,
    dto: AtualizarUsuarioDto,
  ): Promise<UsuarioDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(usuarioId);
      if (!antes) {
        throw new UsuarioNaoEncontradoError();
      }

      if (dto.email && dto.email !== antes.email) {
        const emailEmUso = await repo.existeEmail(dto.email, usuarioId);
        if (emailEmUso) {
          throw new EmailJaCadastradoError();
        }
      }

      const depois = await repo.atualizar(usuarioId, dto, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Usuario',
        entidadeId: usuarioId,
        acao: 'ATUALIZAR',
        dadosAntes: antes,
        dadosDepois: depois,
      });

      return depois;
    });
  }
}
