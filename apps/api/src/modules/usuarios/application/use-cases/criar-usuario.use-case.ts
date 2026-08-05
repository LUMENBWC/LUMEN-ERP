import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  AuthUserIdJaVinculadoError,
  EmailJaCadastradoError,
  PapelNaoEncontradoError,
} from '../../domain/usuario.errors';
import type { CriarUsuarioDto } from '../dto/criar-usuario.dto';
import {
  USUARIOS_REPOSITORY_FACTORY,
  type UsuariosRepositoryFactory,
} from '../ports/usuarios-repository.factory';
import type { UsuarioDetalhado } from '../ports/usuarios.repository.port';

@Injectable()
export class CriarUsuarioUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(USUARIOS_REPOSITORY_FACTORY) private readonly repoFactory: UsuariosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarUsuarioDto): Promise<UsuarioDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const [authUserIdEmUso, emailEmUso, papel] = await Promise.all([
        repo.existeAuthUserId(dto.authUserId),
        repo.existeEmail(dto.email),
        repo.obterPapelPorId(dto.papelId),
      ]);

      if (authUserIdEmUso) {
        throw new AuthUserIdJaVinculadoError();
      }
      if (emailEmUso) {
        throw new EmailJaCadastradoError();
      }
      if (!papel) {
        throw new PapelNaoEncontradoError();
      }

      const usuario = await repo.criar(dto, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Usuario',
        entidadeId: usuario.id,
        acao: 'CRIAR',
        dadosDepois: usuario,
      });

      return usuario;
    });
  }
}
