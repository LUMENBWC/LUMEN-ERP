import type { FormaPagamento } from '@/features/vendas/api/vendas.types';

export type StatusConta = 'ABERTO' | 'PARCIAL' | 'PAGO' | 'CANCELADO';

export interface RecebimentoResumo {
  id: string;
  valor: string;
  data: string;
  formaPagamento: FormaPagamento;
  usuarioId: string;
  usuarioNome: string;
}

export interface ContaReceberResumo {
  id: string;
  vendaId: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  descricao: string;
  valorTotal: string;
  valorRecebido: string;
  vencimento: string;
  status: StatusConta;
  vencida: boolean;
  parcelaNumero: number | null;
  parcelaTotal: number | null;
  createdAt: string;
}

export interface ContaReceberDetalhada extends ContaReceberResumo {
  recebimentos: RecebimentoResumo[];
}

export interface ListarContasReceberResultado {
  items: ContaReceberResumo[];
  total: number;
}

export interface ListarContasReceberParams {
  status?: StatusConta;
  clienteId?: string;
  vencido?: boolean;
  page: number;
  perPage: number;
  sortBy?: 'vencimento' | 'valorTotal' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface PagamentoResumo {
  id: string;
  valor: string;
  data: string;
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
  valorTotal: string;
  valorPago: string;
  vencimento: string;
  status: StatusConta;
  vencida: boolean;
  createdAt: string;
}

export interface ContaPagarDetalhada extends ContaPagarResumo {
  pagamentos: PagamentoResumo[];
}

export interface ListarContasPagarResultado {
  items: ContaPagarResumo[];
  total: number;
}

export interface ListarContasPagarParams {
  status?: StatusConta;
  fornecedorId?: string;
  categoriaDespesaId?: string;
  vencido?: boolean;
  page: number;
  perPage: number;
  sortBy?: 'vencimento' | 'valorTotal' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface CriarContaPagarInput {
  fornecedorId: string | null;
  categoriaDespesaId: string | null;
  descricao: string;
  valorTotal: number;
  vencimento: string;
}

export interface CategoriaDespesaResumo {
  id: string;
  nome: string;
  createdAt: string;
}

export interface ClienteInadimplenteResumo {
  clienteId: string;
  clienteNome: string;
  totalVencido: string;
  quantidadeTitulos: number;
  vencimentoMaisAntigo: string;
}

export interface ListarClientesInadimplentesResultado {
  items: ClienteInadimplenteResumo[];
  total: number;
}

export interface ListarClientesInadimplentesParams {
  page: number;
  perPage: number;
}
