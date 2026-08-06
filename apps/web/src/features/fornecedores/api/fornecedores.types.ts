export type TipoPessoa = 'FISICA' | 'JURIDICA';

export interface FornecedorResumo {
  id: string;
  tipoPessoa: TipoPessoa;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface ProdutoVinculado {
  produtoId: string;
  produtoNome: string;
  produtoSku: string;
}

export interface FornecedorDetalhado extends FornecedorResumo {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  observacoes: string | null;
  updatedAt: string;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
  produtos: ProdutoVinculado[];
}

export interface ListarFornecedoresResultado {
  items: FornecedorResumo[];
  total: number;
}

export interface ListarFornecedoresParams {
  busca?: string;
  tipoPessoa?: TipoPessoa;
  ativo?: boolean;
  page: number;
  perPage: number;
  sortBy?: 'nome' | 'documento' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}
