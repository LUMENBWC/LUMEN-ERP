export interface PapelResumo {
  id: string;
  nome: string;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  filialId: string | null;
  papeis: PapelResumo[];
  createdAt: string;
}

export interface UsuarioDetalhado extends UsuarioResumo {
  authUserId: string;
  updatedAt: string;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface ListarUsuariosResultado {
  items: UsuarioResumo[];
  total: number;
}

export interface ListarUsuariosParams {
  busca?: string;
  ativo?: boolean;
  papelId?: string;
  page: number;
  perPage: number;
  sortBy?: 'nome' | 'email' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface PermissaoResumo {
  id: string;
  chave: string;
  descricao: string | null;
}

export interface PapelComPermissoes {
  id: string;
  nome: string;
  descricao: string | null;
  permissoes: PermissaoResumo[];
}
