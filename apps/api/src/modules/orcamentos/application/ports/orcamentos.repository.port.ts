import type { Prisma } from '../../../../../generated/prisma/client';
import type { StatusOrcamentoValue } from '../../domain/garantir-transicao-status-valida';

export interface OrcamentoItemResumo {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface OrcamentoResumo {
  id: string;
  clienteId: string;
  clienteNome: string;
  status: StatusOrcamentoValue;
  descontoGeral: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  validade: Date | null;
  pdfUrl: string | null;
  createdAt: Date;
}

export interface OrcamentoDetalhado extends OrcamentoResumo {
  observacoes: string | null;
  updatedAt: Date;
  criadoPorNome: string | null;
  atualizadoPorNome: string | null;
  itens: OrcamentoItemResumo[];
}

export interface ItemOrcamentoParaSalvar {
  produtoId: string;
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface SalvarOrcamentoInput {
  clienteId: string;
  itens: ItemOrcamentoParaSalvar[];
  descontoGeral: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  validade: Date | null;
  observacoes: string | null;
}

export interface ListarOrcamentosFiltro {
  clienteId?: string;
  status?: StatusOrcamentoValue;
  page: number;
  perPage: number;
  sortBy: 'validade' | 'total' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

export interface ListarOrcamentosResultado {
  items: OrcamentoResumo[];
  total: number;
}

export interface DadosPdfOrcamento {
  id: string;
  status: StatusOrcamentoValue;
  createdAt: Date;
  validade: Date | null;
  descontoGeral: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  observacoes: string | null;
  clienteNome: string;
  clienteDocumento: string;
  empresaRazaoSocial: string;
  empresaDocumento: string;
  itens: OrcamentoItemResumo[];
}

export interface OrcamentosRepositoryPort {
  criar(input: SalvarOrcamentoInput, criadoPorId: string): Promise<OrcamentoDetalhado>;
  listar(filtro: ListarOrcamentosFiltro): Promise<ListarOrcamentosResultado>;
  obterPorId(id: string): Promise<OrcamentoDetalhado | null>;
  clienteExiste(clienteId: string): Promise<boolean>;
  /** Retorna o subconjunto dos ids informados que efetivamente existe. */
  produtosExistentes(produtoIds: string[]): Promise<Set<string>>;
  /** Substitui clienteId/itens/descontoGeral/validade/observacoes por inteiro (delete + recria os itens). */
  atualizar(
    id: string,
    input: SalvarOrcamentoInput,
    atualizadoPorId: string,
  ): Promise<OrcamentoDetalhado>;
  atualizarStatus(
    id: string,
    status: StatusOrcamentoValue,
    atualizadoPorId: string,
  ): Promise<OrcamentoDetalhado>;
  /** Soft delete (`deletedAt`) - orçamento cancelado some das listagens/buscas normais. */
  cancelar(id: string, atualizadoPorId: string): Promise<void>;
  salvarPdfUrl(id: string, pdfUrl: string): Promise<void>;
  obterDadosParaPdf(id: string): Promise<DadosPdfOrcamento | null>;
}
