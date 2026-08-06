import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  FornecedorNaoEncontradoError,
  VinculoNaoEncontradoError,
} from '../../domain/fornecedor.errors';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';

@Injectable()
export class DesvincularProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, fornecedorId: string, produtoId: string): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const fornecedor = await repo.obterPorId(fornecedorId);
      if (!fornecedor) {
        throw new FornecedorNaoEncontradoError();
      }
      if (!(await repo.vinculoExiste(fornecedorId, produtoId))) {
        throw new VinculoNaoEncontradoError();
      }

      await repo.desvincularProduto(fornecedorId, produtoId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'FornecedorProduto',
        entidadeId: fornecedorId,
        acao: 'DESVINCULAR_PRODUTO',
        dadosAntes: { fornecedorId, produtoId },
      });
    });
  }
}
