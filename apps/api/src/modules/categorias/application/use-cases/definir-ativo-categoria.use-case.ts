import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CategoriaNaoEncontradaError } from '../../domain/categoria.errors';
import {
  CATEGORIAS_REPOSITORY_FACTORY,
  type CategoriasRepositoryFactory,
} from '../ports/categorias-repository.factory';
import type { CategoriaResumo } from '../ports/categorias.repository.port';

@Injectable()
export class DefinirAtivoCategoriaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CATEGORIAS_REPOSITORY_FACTORY)
    private readonly repoFactory: CategoriasRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, id: string, ativo: boolean): Promise<CategoriaResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new CategoriaNaoEncontradaError();
      }

      const depois = await repo.definirAtivo(id, ativo, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Categoria',
        entidadeId: id,
        acao: ativo ? 'ATIVAR' : 'DESATIVAR',
        dadosAntes: { ativo: antes.ativo },
        dadosDepois: { ativo: depois.ativo },
      });

      return depois;
    });
  }
}
