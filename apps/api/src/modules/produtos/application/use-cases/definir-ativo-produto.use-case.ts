import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { ProdutoNaoEncontradoError } from '../../domain/produto.errors';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { ProdutoDetalhado } from '../ports/produtos.repository.port';

@Injectable()
export class DefinirAtivoProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string, ativo: boolean): Promise<ProdutoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new ProdutoNaoEncontradoError();
      }

      const depois = await repo.definirAtivo(id, ativo, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Produto',
        entidadeId: id,
        acao: ativo ? 'ATIVAR' : 'DESATIVAR',
        dadosAntes: { ativo: antes.ativo },
        dadosDepois: { ativo: depois.ativo },
      });

      return depois;
    });
  }
}
