import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  OrcamentoNaoCancelavelError,
  OrcamentoNaoEncontradoError,
} from '../../domain/orcamento.errors';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';

const STATUS_CANCELAVEIS = ['RASCUNHO', 'ENVIADO'];

@Injectable()
export class CancelarOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const atual = await repo.obterPorId(id);
      if (!atual) {
        throw new OrcamentoNaoEncontradoError();
      }
      if (!STATUS_CANCELAVEIS.includes(atual.status)) {
        throw new OrcamentoNaoCancelavelError();
      }

      await repo.cancelar(id, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Orcamento',
        entidadeId: id,
        acao: 'CANCELAR',
        dadosAntes: { status: atual.status },
      });
    });
  }
}
