import type { Prisma } from '../../../../../generated/prisma/client';

export type StatusVendaValue = 'CONCLUIDA' | 'CANCELADA';
export type FormaPagamentoValue =
  'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'CREDITO_PARCELADO' | 'A_PRAZO';
export type StatusContaValue = 'ABERTO' | 'PAGO' | 'PARCIAL' | 'VENCIDO' | 'CANCELADO';

export interface ProdutoParaVenda {
  id: string;
  nome: string;
  estoqueAtual: Prisma.Decimal;
  precoCusto: Prisma.Decimal;
}

export interface ItemVendaParaSalvar {
  produtoId: string;
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
  custoUnitario: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface PagamentoParaSalvar {
  formaPagamento: FormaPagamentoValue;
  valor: Prisma.Decimal;
  parcelas: number | null;
  bandeira: string | null;
}

export interface ContaReceberParaSalvar {
  descricao: string;
  valorTotal: Prisma.Decimal;
  valorRecebido: Prisma.Decimal;
  vencimento: Date;
  status: Extract<StatusContaValue, 'ABERTO' | 'PAGO'>;
  parcelaNumero: number | null;
  parcelaTotal: number | null;
  /** Só usado quando status === 'PAGO', pra gravar o RecebimentoRecebivel correspondente. */
  formaPagamento: FormaPagamentoValue;
}

export interface SalvarVendaInput {
  clienteId: string | null;
  caixaSessaoId: string | null;
  itens: ItemVendaParaSalvar[];
  pagamentos: PagamentoParaSalvar[];
  contasReceber: ContaReceberParaSalvar[];
  descontoGeral: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  custoTotal: Prisma.Decimal;
}

export interface VendaItemResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface VendaPagamentoResumo {
  id: string;
  formaPagamento: FormaPagamentoValue;
  valor: Prisma.Decimal;
  parcelas: number | null;
  bandeira: string | null;
}

export interface VendaResumo {
  id: string;
  clienteId: string | null;
  clienteNome: string | null;
  status: StatusVendaValue;
  subtotal: Prisma.Decimal;
  descontoGeral: Prisma.Decimal;
  total: Prisma.Decimal;
  usuarioId: string;
  usuarioNome: string;
  createdAt: Date;
}

export interface VendaDetalhada extends VendaResumo {
  custoTotal: Prisma.Decimal;
  itens: VendaItemResumo[];
  pagamentos: VendaPagamentoResumo[];
}

export interface ListarVendasFiltro {
  clienteId?: string;
  status?: StatusVendaValue;
  dataInicio?: Date;
  dataFim?: Date;
  page: number;
  perPage: number;
}

export interface ListarVendasResultado {
  items: VendaResumo[];
  total: number;
}

export interface VendasRepositoryPort {
  clienteExiste(clienteId: string): Promise<boolean>;
  /**
   * Bloqueia (`SELECT ... FOR UPDATE`) todos os produtos informados, em
   * ordem determinística de id - evita deadlock entre vendas concorrentes
   * que compartilham produtos no carrinho em ordens diferentes.
   */
  obterProdutosComLock(produtoIds: string[]): Promise<Map<string, ProdutoParaVenda>>;
  criar(input: SalvarVendaInput, usuarioId: string): Promise<VendaDetalhada>;
  obterPorId(id: string): Promise<VendaDetalhada | null>;
  listar(filtro: ListarVendasFiltro): Promise<ListarVendasResultado>;
  /** Marca a venda como CANCELADA (+ deletedAt) e cancela as contas a receber ainda em aberto. */
  cancelar(id: string): Promise<void>;
}
