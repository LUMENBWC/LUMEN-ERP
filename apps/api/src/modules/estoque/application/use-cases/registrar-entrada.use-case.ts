import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularMargemLucro } from '../../../produtos/domain/calcular-margem-lucro';
import { calcularCustoMedioPonderado } from '../../domain/calcular-custo-medio-ponderado';
import { ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarEntradaDto } from '../dto/registrar-entrada.dto';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../ports/estoque-repository.factory';
import type { MovimentacaoResumo } from '../ports/estoque.repository.port';

@Injectable()
export class RegistrarEntradaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ESTOQUE_REPOSITORY_FACTORY) private readonly repoFactory: EstoqueRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: RegistrarEntradaDto): Promise<MovimentacaoResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const produto = await repo.obterProdutoComLock(dto.produtoId);
      if (!produto) {
        throw new ProdutoNaoEncontradoError();
      }

      const quantidade = new Prisma.Decimal(dto.quantidade);
      const custoUnitario = new Prisma.Decimal(dto.custoUnitario);
      const novoCustoMedio = calcularCustoMedioPonderado(
        produto.estoqueAtual,
        produto.precoCusto,
        quantidade,
        custoUnitario,
      );
      const novaMargemLucro = calcularMargemLucro(novoCustoMedio, produto.precoVenda);

      const movimentacao = await repo.registrarEntrada(
        {
          produtoId: dto.produtoId,
          quantidade,
          custoUnitario,
          novoCustoMedio,
          novaMargemLucro,
          fornecedorId: dto.fornecedorId,
          motivo: dto.motivo,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'MovimentacaoEstoque',
        entidadeId: movimentacao.id,
        acao: 'ENTRADA_COMPRA',
        dadosDepois: movimentacao,
      });

      return movimentacao;
    });
  }
}
