import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularMargemLucro } from '../../domain/calcular-margem-lucro';
import {
  CategoriaInvalidaError,
  CodigoBarrasJaCadastradoError,
  ProdutoNaoEncontradoError,
  SkuJaCadastradoError,
} from '../../domain/produto.errors';
import type { AtualizarProdutoDto } from '../dto/atualizar-produto.dto';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { AtualizarProdutoInput, ProdutoDetalhado } from '../ports/produtos.repository.port';

@Injectable()
export class AtualizarProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: AtualizarProdutoDto,
  ): Promise<ProdutoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const antes = await repo.obterPorId(id);
      if (!antes) {
        throw new ProdutoNaoEncontradoError();
      }

      if (dto.sku && dto.sku !== antes.sku) {
        if (await repo.existeSku(dto.sku, id)) {
          throw new SkuJaCadastradoError();
        }
      }
      if (dto.codigoBarras && dto.codigoBarras !== antes.codigoBarras) {
        if (await repo.existeCodigoBarras(dto.codigoBarras, id)) {
          throw new CodigoBarrasJaCadastradoError();
        }
      }
      if (
        dto.categoriaId !== undefined &&
        dto.categoriaId !== antes.categoriaId &&
        dto.categoriaId !== null
      ) {
        if (!(await repo.categoriaExiste(dto.categoriaId))) {
          throw new CategoriaInvalidaError();
        }
      }

      const {
        precoCusto: _dtoCusto,
        precoVenda: _dtoVenda,
        estoqueMinimo: _dtoMinimo,
        ...resto
      } = dto;
      const input: AtualizarProdutoInput = { ...resto };

      if (dto.precoCusto !== undefined || dto.precoVenda !== undefined) {
        const precoCusto = new Prisma.Decimal(dto.precoCusto ?? antes.precoCusto);
        const precoVenda = new Prisma.Decimal(dto.precoVenda ?? antes.precoVenda);
        input.precoCusto = precoCusto;
        input.precoVenda = precoVenda;
        input.margemLucro = calcularMargemLucro(precoCusto, precoVenda);
      }
      if (dto.estoqueMinimo !== undefined) {
        input.estoqueMinimo = new Prisma.Decimal(dto.estoqueMinimo);
      }

      const depois = await repo.atualizar(id, input, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Produto',
        entidadeId: id,
        acao: 'ATUALIZAR',
        dadosAntes: antes,
        dadosDepois: depois,
      });

      return depois;
    });
  }
}
