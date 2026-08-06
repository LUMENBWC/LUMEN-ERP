import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { FornecedorNaoEncontradoError } from '../../domain/fornecedor.errors';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';
import type { FornecedorDetalhado } from '../ports/fornecedores.repository.port';

@Injectable()
export class DefinirAtivoFornecedorUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string, ativo: boolean): Promise<FornecedorDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new FornecedorNaoEncontradoError();
      }

      const depois = await repo.definirAtivo(id, ativo, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Fornecedor',
        entidadeId: id,
        acao: ativo ? 'ATIVAR' : 'DESATIVAR',
        dadosAntes: { ativo: antes.ativo },
        dadosDepois: { ativo: depois.ativo },
      });

      return depois;
    });
  }
}
