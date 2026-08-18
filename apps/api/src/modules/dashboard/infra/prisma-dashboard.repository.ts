import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
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
    // Soma e split (a vencer / vencido) feitos no banco, em vez de carregar
    // todas as contas abertas na memória e somar em JS. `vencimento < hoje`
    // conta como vencido; o restante, a vencer — mesma regra do código antigo.
    const rows = await this.tx.$queryRaw<{ aVencer: Prisma.Decimal; vencido: Prisma.Decimal }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN "vencimento" >= ${hoje} THEN "valorTotal" - "valorRecebido" ELSE 0 END), 0)::numeric AS "aVencer",
        COALESCE(SUM(CASE WHEN "vencimento" <  ${hoje} THEN "valorTotal" - "valorRecebido" ELSE 0 END), 0)::numeric AS "vencido"
      FROM contas_receber
      WHERE "empresaId" = ${this.empresaId}
        AND status IN ('ABERTO', 'PARCIAL')
        AND "deletedAt" IS NULL
    `;
    return this.montarTotalEAging(rows[0]);
  }

  async obterTotalEAgingPagar(hoje: Date): Promise<TotalEAging> {
    const rows = await this.tx.$queryRaw<{ aVencer: Prisma.Decimal; vencido: Prisma.Decimal }[]>`
      SELECT
        COALESCE(SUM(CASE WHEN "vencimento" >= ${hoje} THEN "valorTotal" - "valorPago" ELSE 0 END), 0)::numeric AS "aVencer",
        COALESCE(SUM(CASE WHEN "vencimento" <  ${hoje} THEN "valorTotal" - "valorPago" ELSE 0 END), 0)::numeric AS "vencido"
      FROM contas_pagar
      WHERE "empresaId" = ${this.empresaId}
        AND status IN ('ABERTO', 'PARCIAL')
        AND "deletedAt" IS NULL
    `;
    return this.montarTotalEAging(rows[0]);
  }

  private montarTotalEAging(row?: {
    aVencer: Prisma.Decimal;
    vencido: Prisma.Decimal;
  }): TotalEAging {
    // `new Prisma.Decimal(...)` aceita Decimal | string | number, blindando
    // contra variações de como o driver devolve numeric no $queryRaw.
    const aVencer = row ? new Prisma.Decimal(row.aVencer) : ZERO;
    const vencido = row ? new Prisma.Decimal(row.vencido) : ZERO;
    return { total: aVencer.plus(vencido), aging: { aVencer, vencido } };
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
