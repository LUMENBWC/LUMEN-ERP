import type { StatusOrcamento } from '../api/orcamentos.types';

export const STATUS_LABEL: Record<StatusOrcamento, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CONVERTIDO: 'Convertido',
};

export const STATUS_VARIANT: Record<StatusOrcamento, 'default' | 'secondary' | 'destructive'> = {
  RASCUNHO: 'secondary',
  ENVIADO: 'default',
  APROVADO: 'default',
  RECUSADO: 'destructive',
  EXPIRADO: 'destructive',
  CONVERTIDO: 'default',
};
