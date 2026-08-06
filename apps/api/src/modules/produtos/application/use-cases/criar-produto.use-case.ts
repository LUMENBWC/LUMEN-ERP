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
  SkuJaCadastradoError,
} from '../../domain/produto.errors';
import type { CriarProdutoDto } from '../dto/criar-produto.dto';
import {
  PRODUTOS_REPOSITORY_FACTORY,
  type ProdutosRepositoryFactory,
} from '../ports/produtos-repository.factory';
import type { ProdutoDetalhado } from '../ports/produtos.repository.port';

@Injectable()
export class CriarProdutoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(PRODUTOS_REPOSITORY_FACTORY) private readonly repoFactory: ProdutosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarProdutoDto): Promise<ProdutoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const [skuEmUso, codigoBarrasEmUso, categoriaValida] = await Promise.all([
        repo.existeSku(dto.sku),
        dto.codigoBarras ? repo.existeCodigoBarras(dto.codigoBarras) : Promise.resolve(false),
        dto.categoriaId ? repo.categoriaExiste(dto.categoriaId) : Promise.resolve(true),
      ]);

      if (skuEmUso) {
        throw new SkuJaCadastradoError();
      }
      if (codigoBarrasEmUso) {
        throw new CodigoBarrasJaCadastradoError();
      }
      if (!categoriaValida) {
        throw new CategoriaInvalidaError();
      }

      const precoCusto = new Prisma.Decimal(dto.precoCusto);
      const precoVenda = new Prisma.Decimal(dto.precoVenda);

      const produto = await repo.criar(
        {
          nome: dto.nome,
          descricao: dto.descricao,
          sku: dto.sku,
          codigoBarras: dto.codigoBarras,
          unidadeMedida: dto.unidadeMedida,
          categoriaId: dto.categoriaId,
          precoCusto,
          precoVenda,
          margemLucro: calcularMargemLucro(precoCusto, precoVenda),
          estoqueMinimo: new Prisma.Decimal(dto.estoqueMinimo),
          ncm: dto.ncm,
          cfop: dto.cfop,
          cst: dto.cst,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Produto',
        entidadeId: produto.id,
        acao: 'CRIAR',
        dadosDepois: produto,
      });

      return produto;
    });
  }
}
