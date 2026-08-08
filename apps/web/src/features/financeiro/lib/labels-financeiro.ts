import type { StatusConta } from '../api/financeiro.types';

export const STATUS_LABEL: Record<StatusConta, string> = {
  ABERTO: 'Aberto',
  PARCIAL: 'Parcial',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
};

export const STATUS_VARIANT: Record<StatusConta, 'default' | 'secondary' | 'destructive'> = {
  ABERTO: 'secondary',
  PARCIAL: 'default',
  PAGO: 'default',
  CANCELADO: 'destructive',
};
