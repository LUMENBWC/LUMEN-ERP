import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AgingResumo,
  DashboardRepositoryPort,
  FaturamentoECusto,
  ProdutoMaisVendidoResumo,
  TotalEAging,
} from '../application/ports/dashboard.repository.port';

const ZERO = new Prisma.Decimal(0);
const ENTRADA_CAIXA = ['ABERTURA', 'SUPRIMENTO', 'VENDA'] as const;

export class PrismaDashboardRepository implements DashboardRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async obterFaturamentoECusto(inicio: Date, fim: Date): Promise<FaturamentoECusto> {
    const agregado = await this.tx.venda.aggregate({
      where: { status: 'CONCLUIDA', deletedAt: null, createdAt: { gte: inicio, lte: fim } },
      _sum: { total: true, custoTotal: true },
      _count: { _all: true },
    });

    return {
      faturamento: agregado._sum.total ?? ZERO,
      custoProdutosVendidos: agregado._sum.custoTotal ?? ZERO,
      quantidadeVendas: agregado._count._all,
    };
  }

  async obterDespesasPagas(inicio: Date, fim: Date): Promise<Prisma.Decimal> {
    const agregado = await this.tx.pagamentoPagavel.aggregate({
      where: { data: { gte: inicio, lte: fim } },
      _sum: { valor: true },
    });
    return agregado._sum.valor ?? ZERO;
  }

  async obterTotalEAgingReceber(hoje: Date): Promise<TotalEAging> {
    const contas = await this.tx.contaReceber.findMany({
      where: { status: { in: ['ABERTO', 'PARCIAL'] }, deletedAt: null },
      select: { valorTotal: true, valorRecebido: true, vencimento: true },
    });
    return this.somarAging(
      contas.map((c) => ({ saldo: c.valorTotal.minus(c.valorRecebido), vencimento: c.vencimento })),
      hoje,
    );
  }

  async obterTotalEAgingPagar(hoje: Date): Promise<TotalEAging> {
    const contas = await this.tx.contaPagar.findMany({
      where: { status: { in: ['ABERTO', 'PARCIAL'] }, deletedAt: null },
      select: { valorTotal: true, valorPago: true, vencimento: true },
    });
    return this.somarAging(
      contas.map((c) => ({ saldo: c.valorTotal.minus(c.valorPago), vencimento: c.vencimento })),
      hoje,
    );
  }

  private somarAging(
    itens: { saldo: Prisma.Decimal; vencimento: Date }[],
    hoje: Date,
  ): TotalEAging {
    const aging: AgingResumo = { aVencer: ZERO, vencido: ZERO };
    let total = ZERO;
    for (const item of itens) {
      total = total.plus(item.saldo);
      if (item.vencimento < hoje) {
        aging.vencido = aging.vencido.plus(item.saldo);
      } else {
        aging.aVencer = aging.aVencer.plus(item.saldo);
      }
    }
    return { total, aging };
  }

  async obterProdutosMaisVendidos(
    inicio: Date,
    fim: Date,
    limit: number,
  ): Promise<{ porQuantidade: ProdutoMaisVendidoResumo[]; porValor: ProdutoMaisVendidoResumo[] }> {
    const where: Prisma.VendaItemWhereInput = {
      venda: { status: 'CONCLUIDA', deletedAt: null, createdAt: { gte: inicio, lte: fim } },
    };

    const [porQuantidadeRaw, porValorRaw] = await Promise.all([
      this.tx.vendaItem.groupBy({
        by: ['produtoId'],
        where,
        _sum: { quantidade: true, total: true },
        orderBy: { _sum: { quantidade: 'desc' } },
        take: limit,
      }),
      this.tx.vendaItem.groupBy({
        by: ['produtoId'],
        where,
        _sum: { quantidade: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: limit,
      }),
    ]);

    const produtoIds = [
      ...new Set([...porQuantidadeRaw, ...porValorRaw].map((row) => row.produtoId)),
    ];
    const produtos = await this.tx.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true, nome: true },
    });
    const nomePorId = new Map(produtos.map((p) => [p.id, p.nome]));

    const paraResumo = (row: {
      produtoId: string;
      _sum: { quantidade: Prisma.Decimal | null; total: Prisma.Decimal | null };
    }): ProdutoMaisVendidoResumo => ({
      produtoId: row.produtoId,
      produtoNome: nomePorId.get(row.produtoId) ?? '—',
      quantidadeVendida: row._sum.quantidade ?? ZERO,
      valorVendido: row._sum.total ?? ZERO,
    });

    return {
      porQuantidade: porQuantidadeRaw.map(paraResumo),
      porValor: porValorRaw.map(paraResumo),
    };
  }

  async obterEntradasESaidasCaixa(
    inicio: Date,
    fim: Date,
  ): Promise<{ entradas: Prisma.Decimal; saidas: Prisma.Decimal }> {
    const [entradasAgg, saidasAgg] = await Promise.all([
      this.tx.movimentoCaixa.aggregate({
        where: { tipo: { in: [...ENTRADA_CAIXA] }, data: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
      this.tx.movimentoCaixa.aggregate({
        where: { tipo: 'SANGRIA', data: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
    ]);

    return {
      entradas: entradasAgg._sum.valor ?? ZERO,
      saidas: saidasAgg._sum.valor ?? ZERO,
    };
  }
}
