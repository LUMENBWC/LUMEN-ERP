export interface CategoriaResumo {
  id: string;
  nome: string;
  ativo: boolean;
  categoriaPaiId: string | null;
  categoriaPaiNome: string | null;
  createdAt: string;
}

export interface ListarCategoriasResultado {
  items: CategoriaResumo[];
  total: number;
}

export interface ListarCategoriasParams {
  busca?: string;
  ativo?: boolean;
  apenasRaiz?: boolean;
  page: number;
  perPage: number;
}
