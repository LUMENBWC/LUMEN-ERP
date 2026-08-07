export type StatusCaixaSessao = 'ABERTO' | 'FECHADO';
export type TipoMovimentoCaixa = 'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'FECHAMENTO';

export interface CaixaSessaoResumo {
  id: string;
  usuarioAberturaId: string;
  usuarioAberturaNome: string;
  valorAbertura: string;
  status: StatusCaixaSessao;
  abertoEm: string;
}

export interface MovimentoCaixaResumo {
  id: string;
  tipo: TipoMovimentoCaixa;
  valor: string;
  descricao: string | null;
  origemTipo: string | null;
  origemId: string | null;
  usuarioId: string;
  usuarioNome: string;
  data: string;
}

export interface CaixaSessaoDetalhada extends CaixaSessaoResumo {
  valorFechamentoInformado: string | null;
  valorFechamentoEsperado: string | null;
  diferenca: string | null;
  fechadoEm: string | null;
  valorEsperadoAtual: string;
  movimentos: MovimentoCaixaResumo[];
}

export interface ListarSessoesResultado {
  items: CaixaSessaoResumo[];
  total: number;
}

export interface ListarSessoesParams {
  status?: StatusCaixaSessao;
  page: number;
  perPage: number;
}
