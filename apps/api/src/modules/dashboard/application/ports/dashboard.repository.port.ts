import type { Prisma } from '../../../../../generated/prisma/client';

export interface FaturamentoECusto {
  faturamento: Prisma.Decimal;
  custoProdutosVendidos: Prisma.Decimal;
  quantidadeVendas: number;
}

export interface AgingResumo {
  aVencer: Prisma.Decimal;
  vencido: Prisma.Decimal;
}

export interface TotalEAging {
  total: Prisma.Decimal;
  aging: AgingResumo;
}

export interface ProdutoMaisVendidoResumo {
  produtoId: string;
  produtoNome: string;
  quantidadeVendida: Prisma.Decimal;
  valorVendido: Prisma.Decimal;
}

export interface ResumoFinanceiro {
  periodo: { inicio: Date; fim: Date };
  faturamento: Prisma.Decimal;
  custoProdutosVendidos: Prisma.Decimal;
  despesasPagas: Prisma.Decimal;
  lucro: Prisma.Decimal;
  quantidadeVendas: number;
  totalAReceber: Prisma.Decimal;
  agingReceber: AgingResumo;
  totalAPagar: Prisma.Decimal;
  agingPagar: AgingResumo;
}

export interface DashboardRepositoryPort {
  obterFaturamentoECusto(inicio: Date, fim: Date): Promise<FaturamentoECusto>;
  obterDespesasPagas(inicio: Date, fim: Date): Promise<Prisma.Decimal>;
  obterTotalEAgingReceber(hoje: Date): Promise<TotalEAging>;
  obterTotalEAgingPagar(hoje: Date): Promise<TotalEAging>;
  /** Top produtos por quantidade vendida e por valor vendido, no período (rankings independentes). */
  obterProdutosMaisVendidos(
    inicio: Date,
    fim: Date,
    limit: number,
  ): Promise<{ porQuantidade: ProdutoMaisVendidoResumo[]; porValor: ProdutoMaisVendidoResumo[] }>;
  obterEntradasESaidasCaixa(
    inicio: Date,
    fim: Date,
  ): Promise<{ entradas: Prisma.Decimal; saidas: Prisma.Decimal }>;
}
