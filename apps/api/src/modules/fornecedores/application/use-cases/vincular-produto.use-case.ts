import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  FornecedorNaoEncontradoError,
  ProdutoInvalidoError,
  ProdutoJaVinculadoError,
} from '../../domain/fornecedor.errors';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';

@Injectable()
export class VincularProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, fornecedorId: string, produtoId: string): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const [fornecedor, produtoValido] = await Promise.all([
        repo.obterPorId(fornecedorId),
        repo.produtoExiste(produtoId),
      ]);
      if (!fornecedor) {
        throw new FornecedorNaoEncontradoError();
      }
      if (!produtoValido) {
        throw new ProdutoInvalidoError();
      }
      if (await repo.vinculoExiste(fornecedorId, produtoId)) {
        throw new ProdutoJaVinculadoError();
      }

      await repo.vincularProduto(fornecedorId, produtoId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'FornecedorProduto',
        entidadeId: fornecedorId,
        acao: 'VINCULAR_PRODUTO',
        dadosDepois: { fornecedorId, produtoId },
      });
    });
  }
}
