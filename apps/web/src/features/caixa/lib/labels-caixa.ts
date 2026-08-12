import type { StatusCaixaSessao, TipoMovimentoCaixa } from '../api/caixa.types';

export const STATUS_LABEL: Record<StatusCaixaSessao, string> = {
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
};

export const STATUS_VARIANT: Record<StatusCaixaSessao, 'success' | 'secondary'> = {
  ABERTO: 'success',
  FECHADO: 'secondary',
};

export const TIPO_MOVIMENTO_LABEL: Record<TipoMovimentoCaixa, string> = {
  ABERTURA: 'Abertura',
  SUPRIMENTO: 'Suprimento',
  SANGRIA: 'Sangria',
  VENDA: 'Venda',
  FECHAMENTO: 'Fechamento',
};
