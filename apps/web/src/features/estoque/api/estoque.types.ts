export type TipoMovimentacao = 'ENTRADA_COMPRA' | 'SAIDA_VENDA' | 'AJUSTE_MANUAL' | 'PERDA';

export interface MovimentacaoResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoMovimentacao;
  quantidade: string;
  custoUnitario: string | null;
  saldoApos: string;
  origemTipo: string | null;
  origemId: string | null;
  motivo: string | null;
  usuarioId: string;
  usuarioNome: string;
  fornecedorId: string | null;
  fornecedorNome: string | null;
  data: string;
}

export interface ListarMovimentacoesResultado {
  items: MovimentacaoResumo[];
  total: number;
}

export interface ListarMovimentacoesParams {
  produtoId?: string;
  fornecedorId?: string;
  tipo?: TipoMovimentacao;
  dataInicio?: string;
  dataFim?: string;
  page: number;
  perPage: number;
  sortBy?: 'data' | 'quantidade';
  sortDir?: 'asc' | 'desc';
}
