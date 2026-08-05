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
  createdAt: Date;
}

export interface UsuarioDetalhado extends UsuarioResumo {
  authUserId: string;
  updatedAt: Date;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface CriarUsuarioInput {
  authUserId: string;
  nome: string;
  email: string;
  filialId: string | null;
  papelId: string;
}

export interface AtualizarUsuarioInput {
  nome?: string;
  email?: string;
  filialId?: string | null;
}

export interface ListarUsuariosFiltro {
  busca?: string;
  ativo?: boolean;
  papelId?: string;
  page: number;
  perPage: number;
  sortBy: 'nome' | 'email' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarUsuariosResultado {
  items: UsuarioResumo[];
  total: number;
}

/**
 * Port (Repository Pattern - spec Secao 5.1/8): use-cases depend on this
 * interface, never on Prisma directly. Implemented by
 * `infra/prisma-usuarios.repository.ts`, instantiated fresh per-transaction
 * bound to the tenant-scoped `tx` client from `runInTenantContext`.
 */
export interface UsuariosRepositoryPort {
  criar(input: CriarUsuarioInput, criadoPorId: string): Promise<UsuarioDetalhado>;
  listar(filtro: ListarUsuariosFiltro): Promise<ListarUsuariosResultado>;
  obterPorId(id: string): Promise<UsuarioDetalhado | null>;
  existeAuthUserId(authUserId: string): Promise<boolean>;
  existeEmail(email: string, excluindoId?: string): Promise<boolean>;
  atualizar(
    id: string,
    input: AtualizarUsuarioInput,
    atualizadoPorId: string,
  ): Promise<UsuarioDetalhado>;
  definirAtivo(id: string, ativo: boolean, atualizadoPorId: string): Promise<UsuarioDetalhado>;
  /** Conta usuarios ativos com papel ADMINISTRADOR, opcionalmente excluindo um usuario da contagem. */
  contarAdministradoresAtivos(excluindoUsuarioId?: string): Promise<number>;
  obterPapelPorId(papelId: string): Promise<PapelResumo | null>;
  usuarioTemPapel(usuarioId: string, papelId: string): Promise<boolean>;
  atribuirPapel(usuarioId: string, papelId: string): Promise<void>;
  removerPapel(usuarioId: string, papelId: string): Promise<void>;
}
