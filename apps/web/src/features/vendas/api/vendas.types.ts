export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';
export type FormaPagamento =
  'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'CREDITO_PARCELADO' | 'A_PRAZO';

export interface ItemVendaResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: string;
  precoUnitario: string;
  desconto: string;
  total: string;
}

export interface PagamentoVendaResumo {
  id: string;
  formaPagamento: FormaPagamento;
  valor: string;
  parcelas: number | null;
  bandeira: string | null;
}

export interface VendaResumo {
  id: string;
  clienteId: string | null;
  clienteNome: string | null;
  status: StatusVenda;
  subtotal: string;
  descontoGeral: string;
  total: string;
  usuarioId: string;
  usuarioNome: string;
  createdAt: string;
}

export interface VendaDetalhada extends VendaResumo {
  custoTotal: string;
  itens: ItemVendaResumo[];
  pagamentos: PagamentoVendaResumo[];
}

export interface ListarVendasResultado {
  items: VendaResumo[];
  total: number;
}

export interface ListarVendasParams {
  clienteId?: string;
  status?: StatusVenda;
  page: number;
  perPage: number;
  sortBy?: 'total' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface ItemVendaInput {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
}

export interface PagamentoVendaInput {
  formaPagamento: FormaPagamento;
  valor: number;
  parcelas: number;
  bandeira: string | null;
}

export interface FinalizarVendaInput {
  clienteId: string | null;
  itens: ItemVendaInput[];
  descontoGeral: number;
  pagamentos: PagamentoVendaInput[];
}

export interface ConverterOrcamentoInput {
  orcamentoId: string;
  pagamentos: PagamentoVendaInput[];
}
