import type { FormaPagamento, StatusVenda } from '../api/vendas.types';

export const STATUS_LABEL: Record<StatusVenda, string> = {
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const STATUS_VARIANT: Record<StatusVenda, 'default' | 'secondary' | 'destructive'> = {
  CONCLUIDA: 'default',
  CANCELADA: 'destructive',
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  CREDITO_PARCELADO: 'Crédito parcelado',
  A_PRAZO: 'A prazo (fiado)',
};
