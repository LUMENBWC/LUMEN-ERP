import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { garantirHierarquiaValida } from '../../domain/garantir-hierarquia-valida';
import {
  CategoriaPaiNaoEncontradaError,
  NomeCategoriaJaCadastradoError,
} from '../../domain/categoria.errors';
import type { CriarCategoriaDto } from '../dto/criar-categoria.dto';
import {
  CATEGORIAS_REPOSITORY_FACTORY,
  type CategoriasRepositoryFactory,
} from '../ports/categorias-repository.factory';
import type { CategoriaResumo } from '../ports/categorias.repository.port';

@Injectable()
export class CriarCategoriaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CATEGORIAS_REPOSITORY_FACTORY)
    private readonly repoFactory: CategoriasRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarCategoriaDto): Promise<CategoriaResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const nomeEmUso = await repo.existeNome(dto.nome);
      if (nomeEmUso) {
        throw new NomeCategoriaJaCadastradoError();
      }

      let categoriaPai: CategoriaResumo | null = null;
      if (dto.categoriaPaiId) {
        categoriaPai = await repo.obterPorId(dto.categoriaPaiId);
        if (!categoriaPai) {
          throw new CategoriaPaiNaoEncontradaError();
        }
      }

      garantirHierarquiaValida({
        categoriaId: null,
        categoriaPaiId: dto.categoriaPaiId,
        categoriaPai,
        categoriaTemSubcategorias: false,
      });

      const categoria = await repo.criar(dto, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Categoria',
        entidadeId: categoria.id,
        acao: 'CRIAR',
        dadosDepois: categoria,
      });

      return categoria;
    });
  }
}
