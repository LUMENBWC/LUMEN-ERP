import type { Prisma } from '../../../../../generated/prisma/client';

export type UnidadeMedidaValue = 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'M' | 'CX' | 'PC';

export interface ProdutoResumo {
  id: string;
  nome: string;
  sku: string;
  codigoBarras: string | null;
  unidadeMedida: UnidadeMedidaValue;
  categoriaId: string | null;
  categoriaNome: string | null;
  precoCusto: Prisma.Decimal;
  precoVenda: Prisma.Decimal;
  margemLucro: Prisma.Decimal;
  estoqueAtual: Prisma.Decimal;
  estoqueMinimo: Prisma.Decimal;
  ativo: boolean;
  createdAt: Date;
}

export interface ProdutoDetalhado extends ProdutoResumo {
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
  updatedAt: Date;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface CriarProdutoInput {
  nome: string;
  descricao: string | null;
  sku: string;
  codigoBarras: string | null;
  unidadeMedida: UnidadeMedidaValue;
  categoriaId: string | null;
  precoCusto: Prisma.Decimal;
  precoVenda: Prisma.Decimal;
  margemLucro: Prisma.Decimal;
  estoqueMinimo: Prisma.Decimal;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
}

export type AtualizarProdutoInput = Partial<Omit<CriarProdutoInput, 'margemLucro'>> & {
  margemLucro?: Prisma.Decimal;
};

export interface ListarProdutosFiltro {
  busca?: string;
  categoriaId?: string;
  ativo?: boolean;
  abaixoDoMinimo?: boolean;
  page: number;
  perPage: number;
  sortBy: 'nome' | 'sku' | 'precoVenda' | 'estoqueAtual' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarProdutosResultado {
  items: ProdutoResumo[];
  total: number;
}

export interface ProdutosRepositoryPort {
  criar(input: CriarProdutoInput, criadoPorId: string): Promise<ProdutoDetalhado>;
  listar(filtro: ListarProdutosFiltro): Promise<ListarProdutosResultado>;
  obterPorId(id: string): Promise<ProdutoDetalhado | null>;
  existeSku(sku: string, excluindoId?: string): Promise<boolean>;
  existeCodigoBarras(codigoBarras: string, excluindoId?: string): Promise<boolean>;
  categoriaExiste(categoriaId: string): Promise<boolean>;
  atualizar(
    id: string,
    input: AtualizarProdutoInput,
    atualizadoPorId: string,
  ): Promise<ProdutoDetalhado>;
  definirAtivo(id: string, ativo: boolean, atualizadoPorId: string): Promise<ProdutoDetalhado>;
  listarAbaixoDoMinimo(): Promise<ProdutoResumo[]>;
}
