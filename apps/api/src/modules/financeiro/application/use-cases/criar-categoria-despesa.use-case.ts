import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CategoriaDespesaDuplicadaError } from '../../domain/financeiro.errors';
import type { CriarCategoriaDespesaDto } from '../dto/criar-categoria-despesa.dto';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';
import type { CategoriaDespesaResumo } from '../ports/financeiro.repository.port';

@Injectable()
export class CriarCategoriaDespesaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    dto: CriarCategoriaDespesaDto,
  ): Promise<CategoriaDespesaResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      if (await repo.categoriaDespesaExistePorNome(dto.nome)) {
        throw new CategoriaDespesaDuplicadaError();
      }

      const categoria = await repo.criarCategoriaDespesa(dto.nome);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'CategoriaDespesa',
        entidadeId: categoria.id,
        acao: 'CRIAR',
        dadosDepois: categoria,
      });

      return categoria;
    });
  }
}
