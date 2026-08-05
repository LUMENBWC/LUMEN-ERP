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

export interface PapeisRepositoryPort {
  listarPapeisDaEmpresa(): Promise<PapelComPermissoes[]>;
}
