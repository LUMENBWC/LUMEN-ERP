import type { StatusOrcamento } from '../api/orcamentos.types';

export const STATUS_LABEL: Record<StatusOrcamento, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CONVERTIDO: 'Convertido',
};

export const STATUS_VARIANT: Record<
  StatusOrcamento,
  'secondary' | 'info' | 'success' | 'warning' | 'destructive'
> = {
  RASCUNHO: 'secondary',
  ENVIADO: 'info',
  APROVADO: 'success',
  RECUSADO: 'destructive',
  EXPIRADO: 'warning',
  CONVERTIDO: 'success',
};
