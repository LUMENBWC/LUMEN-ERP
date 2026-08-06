export type StatusOrcamento =
  'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO' | 'CONVERTIDO';

export interface OrcamentoItemResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: string;
  precoUnitario: string;
  desconto: string;
  total: string;
}

export interface OrcamentoResumo {
  id: string;
  clienteId: string;
  clienteNome: string;
  status: StatusOrcamento;
  descontoGeral: string;
  subtotal: string;
  total: string;
  validade: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

export interface OrcamentoDetalhado extends OrcamentoResumo {
  observacoes: string | null;
  updatedAt: string;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
  itens: OrcamentoItemResumo[];
}

export interface ListarOrcamentosResultado {
  items: OrcamentoResumo[];
  total: number;
}

export interface ListarOrcamentosParams {
  clienteId?: string;
  status?: StatusOrcamento;
  page: number;
  perPage: number;
  sortBy?: 'validade' | 'total' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}
