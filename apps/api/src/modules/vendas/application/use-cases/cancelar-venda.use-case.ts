import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../../../estoque/application/ports/estoque-repository.factory';
import { VendaJaCanceladaError, VendaNaoEncontradaError } from '../../domain/venda.errors';
import {
  VENDAS_REPOSITORY_FACTORY,
  type VendasRepositoryFactory,
} from '../ports/vendas-repository.factory';

@Injectable()
export class CancelarVendaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(VENDAS_REPOSITORY_FACTORY) private readonly vendasRepoFactory: VendasRepositoryFactory,
    @Inject(ESTOQUE_REPOSITORY_FACTORY)
    private readonly estoqueRepoFactory: EstoqueRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const vendasRepo = this.vendasRepoFactory(tx, tenant.empresaId);
      const estoqueRepo = this.estoqueRepoFactory(tx, tenant.empresaId);

      const venda = await vendasRepo.obterPorId(id);
      if (!venda) {
        throw new VendaNaoEncontradaError();
      }
      if (venda.status === 'CANCELADA') {
        throw new VendaJaCanceladaError();
      }

      for (const item of venda.itens) {
        const produto = await estoqueRepo.obterProdutoComLock(item.produtoId);
        if (!produto) continue;
        await estoqueRepo.registrarDelta(
          {
            produtoId: item.produtoId,
            tipo: 'AJUSTE_MANUAL',
            delta: item.quantidade,
            saldoApos: produto.estoqueAtual.plus(item.quantidade),
            motivo: `Estorno de estoque - cancelamento da venda ${id}`,
            origemTipo: 'Venda',
            origemId: id,
          },
          tenant.usuarioId,
        );
      }

      await vendasRepo.cancelar(id);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Venda',
        entidadeId: id,
        acao: 'CANCELAR',
        dadosAntes: { status: venda.status },
      });
    });
  }
}
