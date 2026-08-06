import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
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
export class DefinirAtivoClienteUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CLIENTES_REPOSITORY_FACTORY) private readonly repoFactory: ClientesRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string, ativo: boolean): Promise<ClienteDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new ClienteNaoEncontradoError();
      }

      const depois = await repo.definirAtivo(id, ativo, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Cliente',
        entidadeId: id,
        acao: ativo ? 'ATIVAR' : 'DESATIVAR',
        dadosAntes: { ativo: antes.ativo },
        dadosDepois: { ativo: depois.ativo },
      });

      return depois;
    });
  }
}
