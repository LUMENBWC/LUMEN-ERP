import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { garantirHierarquiaValida } from '../../domain/garantir-hierarquia-valida';
import {
  CategoriaNaoEncontradaError,
  CategoriaPaiNaoEncontradaError,
  NomeCategoriaJaCadastradoError,
} from '../../domain/categoria.errors';
import type { AtualizarCategoriaDto } from '../dto/atualizar-categoria.dto';
import {
  CATEGORIAS_REPOSITORY_FACTORY,
  type CategoriasRepositoryFactory,
} from '../ports/categorias-repository.factory';
import type { CategoriaResumo } from '../ports/categorias.repository.port';

@Injectable()
export class AtualizarCategoriaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CATEGORIAS_REPOSITORY_FACTORY)
    private readonly repoFactory: CategoriasRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: AtualizarCategoriaDto,
  ): Promise<CategoriaResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new CategoriaNaoEncontradaError();
      }

      if (dto.nome && dto.nome !== antes.nome) {
        const nomeEmUso = await repo.existeNome(dto.nome, id);
        if (nomeEmUso) {
          throw new NomeCategoriaJaCadastradoError();
        }
      }

      if (dto.categoriaPaiId !== undefined && dto.categoriaPaiId !== antes.categoriaPaiId) {
        let categoriaPai: CategoriaResumo | null = null;
        if (dto.categoriaPaiId) {
          categoriaPai = await repo.obterPorId(dto.categoriaPaiId);
          if (!categoriaPai) {
            throw new CategoriaPaiNaoEncontradaError();
          }
        }
        const categoriaTemSubcategorias = await repo.temSubcategorias(id);
        garantirHierarquiaValida({
          categoriaId: id,
          categoriaPaiId: dto.categoriaPaiId,
          categoriaPai,
          categoriaTemSubcategorias,
        });
      }

      const depois = await repo.atualizar(id, dto, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Categoria',
        entidadeId: id,
        acao: 'ATUALIZAR',
        dadosAntes: antes,
        dadosDepois: depois,
      });

      return depois;
    });
  }
}
