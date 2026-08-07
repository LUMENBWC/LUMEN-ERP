import type { Prisma } from '../../../../../generated/prisma/client';

export type TipoMovimentoCaixaValue =
  'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'FECHAMENTO';
export type StatusCaixaSessaoValue = 'ABERTO' | 'FECHADO';

export interface CaixaSessaoResumo {
  id: string;
  usuarioAberturaId: string;
  usuarioAberturaNome: string;
  valorAbertura: Prisma.Decimal;
  status: StatusCaixaSessaoValue;
  abertoEm: Date;
}

export interface MovimentoCaixaResumo {
  id: string;
  tipo: TipoMovimentoCaixaValue;
  valor: Prisma.Decimal;
  descricao: string | null;
  origemTipo: string | null;
  origemId: string | null;
  usuarioId: string;
  usuarioNome: string;
  data: Date;
}

export interface CaixaSessaoDetalhada extends CaixaSessaoResumo {
  valorFechamentoInformado: Prisma.Decimal | null;
  valorFechamentoEsperado: Prisma.Decimal | null;
  diferenca: Prisma.Decimal | null;
  fechadoEm: Date | null;
  /**
   * Recalculado a partir dos movimentos a cada leitura - para uma sessão
   * ainda ABERTA é o saldo "ao vivo"; para uma sessão FECHADA coincide com
   * `valorFechamentoEsperado` (o valor travado no momento do fechamento).
   */
  valorEsperadoAtual: Prisma.Decimal;
  movimentos: MovimentoCaixaResumo[];
}

export interface AbrirCaixaInput {
  valorAbertura: Prisma.Decimal;
}

export interface RegistrarMovimentoInput {
  caixaSessaoId: string;
  tipo: TipoMovimentoCaixaValue;
  valor: Prisma.Decimal;
  descricao?: string | null;
  origemTipo?: string;
  origemId?: string;
}

export interface FecharCaixaInput {
  caixaSessaoId: string;
  valorFechamentoInformado: Prisma.Decimal;
  valorFechamentoEsperado: Prisma.Decimal;
  diferenca: Prisma.Decimal;
}

export interface ListarSessoesFiltro {
  status?: StatusCaixaSessaoValue;
  page: number;
  perPage: number;
}

export interface ListarSessoesResultado {
  items: CaixaSessaoResumo[];
  total: number;
}

export interface CaixaRepositoryPort {
  /** Sessão de caixa aberta da empresa, se existir (uma por vez - ver ADR do módulo). */
  sessaoAbertaDaEmpresa(): Promise<CaixaSessaoResumo | null>;
  abrir(input: AbrirCaixaInput, usuarioId: string): Promise<CaixaSessaoResumo>;
  registrarMovimento(input: RegistrarMovimentoInput, usuarioId: string): Promise<void>;
  listarMovimentos(caixaSessaoId: string): Promise<MovimentoCaixaResumo[]>;
  fechar(input: FecharCaixaInput): Promise<CaixaSessaoResumo>;
  obterSessaoPorId(id: string): Promise<CaixaSessaoDetalhada | null>;
  listarSessoes(filtro: ListarSessoesFiltro): Promise<ListarSessoesResultado>;
}
