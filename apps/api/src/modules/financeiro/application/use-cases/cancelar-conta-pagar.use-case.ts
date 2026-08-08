import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  ContaPagarNaoCancelavelError,
  ContaPagarNaoEncontradaError,
} from '../../domain/financeiro.errors';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';

@Injectable()
export class CancelarContaPagarUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const conta = await repo.obterContaPagarComLock(id);
      if (!conta) {
        throw new ContaPagarNaoEncontradaError();
      }
      if (conta.valorAcumulado.greaterThan(0) || conta.status !== 'ABERTO') {
        throw new ContaPagarNaoCancelavelError();
      }

      await repo.cancelarContaPagar(id, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'ContaPagar',
        entidadeId: id,
        acao: 'CANCELAR',
      });
    });
  }
}
