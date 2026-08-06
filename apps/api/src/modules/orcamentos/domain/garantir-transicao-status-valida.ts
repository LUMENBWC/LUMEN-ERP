import { TransicaoStatusInvalidaError } from './orcamento.errors';

export type StatusOrcamentoValue =
  'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO' | 'CONVERTIDO';

/**
 * Regra pura (spec Secao 3.5). Grafo de transições manuais permitidas via
 * `PATCH /orcamentos/:id/status`:
 *
 * RASCUNHO -> ENVIADO
 * ENVIADO  -> APROVADO | RECUSADO | EXPIRADO
 * APROVADO -> EXPIRADO (aprovado mas nunca convertido antes da validade vencer)
 *
 * `CONVERTIDO` nunca é um destino válido aqui de propósito - só é alcançado
 * pelo fluxo dedicado de "converter em venda" (Etapa 9, ainda não
 * implementado porque o módulo Venda não existe). RECUSADO/EXPIRADO são
 * estados finais (sem transições de saída pelo endpoint genérico).
 */
const TRANSICOES_VALIDAS: Record<StatusOrcamentoValue, readonly StatusOrcamentoValue[]> = {
  RASCUNHO: ['ENVIADO'],
  ENVIADO: ['APROVADO', 'RECUSADO', 'EXPIRADO'],
  APROVADO: ['EXPIRADO'],
  RECUSADO: [],
  EXPIRADO: [],
  CONVERTIDO: [],
};

export function garantirTransicaoStatusValida(
  atual: StatusOrcamentoValue,
  novo: StatusOrcamentoValue,
): void {
  if (!TRANSICOES_VALIDAS[atual].includes(novo)) {
    throw new TransicaoStatusInvalidaError(atual, novo);
  }
}
