import type { Prisma } from '../../../../../generated/prisma/client';

export type TipoMovimentacaoValue = 'ENTRADA_COMPRA' | 'SAIDA_VENDA' | 'AJUSTE_MANUAL' | 'PERDA';

export interface ProdutoParaMovimentacao {
  id: string;
  nome: string;
  estoqueAtual: Prisma.Decimal;
  precoCusto: Prisma.Decimal;
  precoVenda: Prisma.Decimal;
}

export interface MovimentacaoResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoMovimentacaoValue;
  quantidade: Prisma.Decimal;
  custoUnitario: Prisma.Decimal | null;
  saldoApos: Prisma.Decimal;
  origemTipo: string | null;
  origemId: string | null;
  motivo: string | null;
  usuarioId: string;
  usuarioNome: string;
  fornecedorId: string | null;
  fornecedorNome: string | null;
  data: Date;
}

export interface RegistrarEntradaInput {
  produtoId: string;
  quantidade: Prisma.Decimal;
  custoUnitario: Prisma.Decimal;
  /** Já calculados pelo use-case (regra pura), a partir do produto lido sob lock. */
  novoCustoMedio: Prisma.Decimal;
  novaMargemLucro: Prisma.Decimal;
  fornecedorId: string | null;
  motivo: string | null;
}

export interface RegistrarDeltaInput {
  produtoId: string;
  tipo: Extract<TipoMovimentacaoValue, 'AJUSTE_MANUAL' | 'PERDA' | 'SAIDA_VENDA'>;
  /** Sinalizado: positivo aumenta o estoque, negativo reduz. */
  delta: Prisma.Decimal;
  /** Já calculado e validado pelo use-case a partir do produto lido sob lock. */
  saldoApos: Prisma.Decimal;
  motivo: string | null;
  /** Rastreabilidade para SAIDA_VENDA (aponta pra Venda que gerou o movimento). */
  origemTipo?: string;
  origemId?: string;
}

export interface ListarMovimentacoesFiltro {
  produtoId?: string;
  fornecedorId?: string;
  tipo?: TipoMovimentacaoValue;
  dataInicio?: Date;
  dataFim?: Date;
  page: number;
  perPage: number;
}

export interface ListarMovimentacoesResultado {
  items: MovimentacaoResumo[];
  total: number;
}

export interface EstoqueRepositoryPort {
  /**
   * Bloqueia a linha do produto (`SELECT ... FOR UPDATE`) pelo resto da
   * transação, para que o cálculo de custo médio ponderado / saldo
   * resultante nunca corra contra uma escrita concorrente no mesmo produto.
   */
  obterProdutoComLock(produtoId: string): Promise<ProdutoParaMovimentacao | null>;
  fornecedorExiste(fornecedorId: string): Promise<boolean>;
  registrarEntrada(input: RegistrarEntradaInput, usuarioId: string): Promise<MovimentacaoResumo>;
  registrarDelta(input: RegistrarDeltaInput, usuarioId: string): Promise<MovimentacaoResumo>;
  listar(filtro: ListarMovimentacoesFiltro): Promise<ListarMovimentacoesResultado>;
}
