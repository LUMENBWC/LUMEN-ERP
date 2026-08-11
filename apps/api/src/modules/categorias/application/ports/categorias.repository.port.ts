export interface CategoriaResumo {
  id: string;
  nome: string;
  ativo: boolean;
  categoriaPaiId: string | null;
  categoriaPaiNome: string | null;
  createdAt: Date;
}

export interface CriarCategoriaInput {
  nome: string;
  categoriaPaiId: string | null;
}

export interface AtualizarCategoriaInput {
  nome?: string;
  categoriaPaiId?: string | null;
}

export interface ListarCategoriasFiltro {
  busca?: string;
  ativo?: boolean;
  apenasRaiz?: boolean;
  page: number;
  perPage: number;
  sortBy: 'nome' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarCategoriasResultado {
  items: CategoriaResumo[];
  total: number;
}

export interface CategoriasRepositoryPort {
  criar(input: CriarCategoriaInput, criadoPorId: string): Promise<CategoriaResumo>;
  listar(filtro: ListarCategoriasFiltro): Promise<ListarCategoriasResultado>;
  obterPorId(id: string): Promise<CategoriaResumo | null>;
  existeNome(nome: string, excluindoId?: string): Promise<boolean>;
  temSubcategorias(id: string): Promise<boolean>;
  atualizar(
    id: string,
    input: AtualizarCategoriaInput,
    atualizadoPorId: string,
  ): Promise<CategoriaResumo>;
  definirAtivo(id: string, ativo: boolean, atualizadoPorId: string): Promise<CategoriaResumo>;
}
