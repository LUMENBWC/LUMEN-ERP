export type TipoPessoa = 'FISICA' | 'JURIDICA';

export interface ClienteResumo {
  id: string;
  tipoPessoa: TipoPessoa;
  nome: string;
  documento: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  limiteCredito: string;
  ativo: boolean;
  createdAt: string;
}

export interface ClienteDetalhado extends ClienteResumo {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  observacoes: string | null;
  updatedAt: string;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface ListarClientesResultado {
  items: ClienteResumo[];
  total: number;
}

export interface ListarClientesParams {
  busca?: string;
  tipoPessoa?: TipoPessoa;
  ativo?: boolean;
  page: number;
  perPage: number;
  sortBy?: 'nome' | 'documento' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}
