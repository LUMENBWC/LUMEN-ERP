export type UnidadeMedida = 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'M' | 'CX' | 'PC';

export interface ProdutoResumo {
  id: string;
  nome: string;
  sku: string;
  codigoBarras: string | null;
  unidadeMedida: UnidadeMedida;
  categoriaId: string | null;
  categoriaNome: string | null;
  precoCusto: string;
  precoVenda: string;
  margemLucro: string;
  estoqueAtual: string;
  estoqueMinimo: string;
  ativo: boolean;
  createdAt: string;
}

export interface ProdutoDetalhado extends ProdutoResumo {
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
  updatedAt: string;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface ListarProdutosResultado {
  items: ProdutoResumo[];
  total: number;
}

export interface ListarProdutosParams {
  busca?: string;
  categoriaId?: string;
  ativo?: boolean;
  abaixoDoMinimo?: boolean;
  page: number;
  perPage: number;
  sortBy?: 'nome' | 'sku' | 'precoVenda' | 'estoqueAtual' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}
