import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { garantirTransicaoStatusValida } from '../../domain/garantir-transicao-status-valida';
import { OrcamentoNaoEncontradoError } from '../../domain/orcamento.errors';
import type { AtualizarStatusOrcamentoDto } from '../dto/atualizar-status-orcamento.dto';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';
import type { OrcamentoDetalhado } from '../ports/orcamentos.repository.port';

@Injectable()
export class AtualizarStatusOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: AtualizarStatusOrcamentoDto,
  ): Promise<OrcamentoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const atual = await repo.obterPorId(id);
      if (!atual) {
        throw new OrcamentoNaoEncontradoError();
      }
      garantirTransicaoStatusValida(atual.status, dto.status);

      const orcamento = await repo.atualizarStatus(id, dto.status, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Orcamento',
        entidadeId: id,
        acao: `STATUS_${dto.status}`,
        dadosAntes: { status: atual.status },
        dadosDepois: { status: orcamento.status },
      });

      return orcamento;
    });
  }
}
