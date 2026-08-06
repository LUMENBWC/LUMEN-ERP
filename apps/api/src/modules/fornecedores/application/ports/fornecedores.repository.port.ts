export type TipoPessoaValue = 'FISICA' | 'JURIDICA';

export interface FornecedorResumo {
  id: string;
  tipoPessoa: TipoPessoaValue;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
  createdAt: Date;
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
  updatedAt: Date;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
  produtos: ProdutoVinculado[];
}

export interface CriarFornecedorInput {
  tipoPessoa: TipoPessoaValue;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  observacoes: string | null;
}

export type AtualizarFornecedorInput = Partial<CriarFornecedorInput>;

export interface ListarFornecedoresFiltro {
  busca?: string;
  tipoPessoa?: TipoPessoaValue;
  ativo?: boolean;
  page: number;
  perPage: number;
  sortBy: 'nome' | 'documento' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarFornecedoresResultado {
  items: FornecedorResumo[];
  total: number;
}

export interface FornecedoresRepositoryPort {
  criar(input: CriarFornecedorInput, criadoPorId: string): Promise<FornecedorDetalhado>;
  listar(filtro: ListarFornecedoresFiltro): Promise<ListarFornecedoresResultado>;
  obterPorId(id: string): Promise<FornecedorDetalhado | null>;
  existeDocumento(documento: string, excluindoId?: string): Promise<boolean>;
  atualizar(
    id: string,
    input: AtualizarFornecedorInput,
    atualizadoPorId: string,
  ): Promise<FornecedorDetalhado>;
  definirAtivo(id: string, ativo: boolean, atualizadoPorId: string): Promise<FornecedorDetalhado>;
  produtoExiste(produtoId: string): Promise<boolean>;
  vinculoExiste(fornecedorId: string, produtoId: string): Promise<boolean>;
  vincularProduto(fornecedorId: string, produtoId: string): Promise<void>;
  desvincularProduto(fornecedorId: string, produtoId: string): Promise<void>;
}
