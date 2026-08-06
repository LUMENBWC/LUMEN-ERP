import type { Prisma } from '../../../../../generated/prisma/client';

export type TipoPessoaValue = 'FISICA' | 'JURIDICA';

export interface ClienteResumo {
  id: string;
  tipoPessoa: TipoPessoaValue;
  nome: string;
  documento: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  limiteCredito: Prisma.Decimal;
  ativo: boolean;
  createdAt: Date;
}

export interface ClienteDetalhado extends ClienteResumo {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  observacoes: string | null;
  updatedAt: Date;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
}

export interface CriarClienteInput {
  tipoPessoa: TipoPessoaValue;
  nome: string;
  documento: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  limiteCredito: Prisma.Decimal;
  observacoes: string | null;
}

export type AtualizarClienteInput = Partial<CriarClienteInput>;

export interface ListarClientesFiltro {
  busca?: string;
  tipoPessoa?: TipoPessoaValue;
  ativo?: boolean;
  page: number;
  perPage: number;
  sortBy: 'nome' | 'documento' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarClientesResultado {
  items: ClienteResumo[];
  total: number;
}

export interface ClientesRepositoryPort {
  criar(input: CriarClienteInput, criadoPorId: string): Promise<ClienteDetalhado>;
  listar(filtro: ListarClientesFiltro): Promise<ListarClientesResultado>;
  obterPorId(id: string): Promise<ClienteDetalhado | null>;
  existeDocumento(documento: string, excluindoId?: string): Promise<boolean>;
  atualizar(
    id: string,
    input: AtualizarClienteInput,
    atualizadoPorId: string,
  ): Promise<ClienteDetalhado>;
  definirAtivo(id: string, ativo: boolean, atualizadoPorId: string): Promise<ClienteDetalhado>;
}
