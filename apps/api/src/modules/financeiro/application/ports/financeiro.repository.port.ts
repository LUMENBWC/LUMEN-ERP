import type { Prisma } from '../../../../../generated/prisma/client';
import type { StatusContaBase } from '../../domain/calcular-status-conta';

export type StatusContaValue = 'ABERTO' | 'PARCIAL' | 'PAGO' | 'CANCELADO';
export type FormaPagamentoValue =
  'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'CREDITO_PARCELADO' | 'A_PRAZO';

/** Retorno comum de `obter*ComLock` - o suficiente pra calcular o novo status, nada mais. */
export interface ContaParaLancamento {
  id: string;
  valorTotal: Prisma.Decimal;
  valorAcumulado: Prisma.Decimal;
  status: StatusContaValue;
}

export interface RecebimentoResumo {
  id: string;
  valor: Prisma.Decimal;
  data: Date;
  formaPagamento: FormaPagamentoValue;
  usuarioId: string;
  usuarioNome: string;
}

export interface ContaReceberResumo {
  id: string;
  vendaId: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  descricao: string;
  valorTotal: Prisma.Decimal;
  valorRecebido: Prisma.Decimal;
  vencimento: Date;
  status: StatusContaValue;
  vencida: boolean;
  parcelaNumero: number | null;
  parcelaTotal: number | null;
  createdAt: Date;
}

export interface ContaReceberDetalhada extends ContaReceberResumo {
  recebimentos: RecebimentoResumo[];
}

export interface ListarContasReceberFiltro {
  status?: StatusContaValue;
  clienteId?: string;
  vencido?: boolean;
  page: number;
  perPage: number;
}

export interface ListarContasReceberResultado {
  items: ContaReceberResumo[];
  total: number;
}

export interface RegistrarRecebimentoInput {
  contaReceberId: string;
  valor: Prisma.Decimal;
  novoValorRecebido: Prisma.Decimal;
  novoStatus: StatusContaBase;
  formaPagamento: FormaPagamentoValue;
}

export interface PagamentoResumo {
  id: string;
  valor: Prisma.Decimal;
  data: Date;
  usuarioId: string;
  usuarioNome: string;
}

export interface ContaPagarResumo {
  id: string;
  fornecedorId: string | null;
  fornecedorNome: string | null;
  categoriaDespesaId: string | null;
  categoriaDespesaNome: string | null;
  descricao: string;
  valorTotal: Prisma.Decimal;
  valorPago: Prisma.Decimal;
  vencimento: Date;
  status: StatusContaValue;
  vencida: boolean;
  createdAt: Date;
}

export interface ContaPagarDetalhada extends ContaPagarResumo {
  pagamentos: PagamentoResumo[];
}

export interface CriarContaPagarInput {
  fornecedorId: string | null;
  categoriaDespesaId: string | null;
  descricao: string;
  valorTotal: Prisma.Decimal;
  vencimento: Date;
}

export interface ListarContasPagarFiltro {
  status?: StatusContaValue;
  fornecedorId?: string;
  categoriaDespesaId?: string;
  vencido?: boolean;
  page: number;
  perPage: number;
}

export interface ListarContasPagarResultado {
  items: ContaPagarResumo[];
  total: number;
}

export interface RegistrarPagamentoInput {
  contaPagarId: string;
  valor: Prisma.Decimal;
  novoValorPago: Prisma.Decimal;
  novoStatus: StatusContaBase;
}

export interface CategoriaDespesaResumo {
  id: string;
  nome: string;
  createdAt: Date;
}

export interface FinanceiroRepositoryPort {
  // Contas a receber
  /** `SELECT ... FOR UPDATE` - trava a linha pelo resto da transação antes de calcular o novo status. */
  obterContaReceberComLock(id: string): Promise<ContaParaLancamento | null>;
  registrarRecebimento(input: RegistrarRecebimentoInput, usuarioId: string): Promise<void>;
  listarContasReceber(filtro: ListarContasReceberFiltro): Promise<ListarContasReceberResultado>;
  obterContaReceberPorId(id: string): Promise<ContaReceberDetalhada | null>;

  // Categorias de despesa
  criarCategoriaDespesa(nome: string): Promise<CategoriaDespesaResumo>;
  categoriaDespesaExistePorNome(nome: string): Promise<boolean>;
  categoriaDespesaExiste(id: string): Promise<boolean>;
  listarCategoriasDespesa(): Promise<CategoriaDespesaResumo[]>;

  // Contas a pagar
  fornecedorExiste(id: string): Promise<boolean>;
  criarContaPagar(input: CriarContaPagarInput, usuarioId: string): Promise<ContaPagarDetalhada>;
  obterContaPagarComLock(id: string): Promise<ContaParaLancamento | null>;
  registrarPagamento(input: RegistrarPagamentoInput, usuarioId: string): Promise<void>;
  listarContasPagar(filtro: ListarContasPagarFiltro): Promise<ListarContasPagarResultado>;
  obterContaPagarPorId(id: string): Promise<ContaPagarDetalhada | null>;
  cancelarContaPagar(id: string, usuarioId: string): Promise<void>;
}
