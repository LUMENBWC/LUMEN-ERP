'use client';

import { Button } from '@/components/ui/button';
import { useAtualizarStatusOrcamento, useCancelarOrcamento } from '../api/orcamentos.queries';
import type { OrcamentoDetalhado, StatusOrcamento } from '../api/orcamentos.types';

const PROXIMOS_STATUS: Record<StatusOrcamento, { status: StatusOrcamento; label: string }[]> = {
  RASCUNHO: [{ status: 'ENVIADO', label: 'Marcar como enviado' }],
  ENVIADO: [
    { status: 'APROVADO', label: 'Marcar como aprovado' },
    { status: 'RECUSADO', label: 'Marcar como recusado' },
    { status: 'EXPIRADO', label: 'Marcar como expirado' },
  ],
  APROVADO: [{ status: 'EXPIRADO', label: 'Marcar como expirado' }],
  RECUSADO: [],
  EXPIRADO: [],
  CONVERTIDO: [],
};

const STATUS_CANCELAVEIS: StatusOrcamento[] = ['RASCUNHO', 'ENVIADO'];

export function OrcamentoStatusActions({
  orcamento,
  onCancelled,
}: {
  orcamento: OrcamentoDetalhado;
  onCancelled?: () => void;
}) {
  const atualizarStatus = useAtualizarStatusOrcamento(orcamento.id);
  const cancelar = useCancelarOrcamento(orcamento.id);

  const acoes = PROXIMOS_STATUS[orcamento.status];
  const podeCancelar = STATUS_CANCELAVEIS.includes(orcamento.status);

  if (acoes.length === 0 && !podeCancelar) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {acoes.map((acao) => (
        <Button
          key={acao.status}
          type="button"
          variant="outline"
          size="sm"
          disabled={atualizarStatus.isPending}
          onClick={() => atualizarStatus.mutate(acao.status)}
        >
          {acao.label}
        </Button>
      ))}
      {podeCancelar && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive"
          disabled={cancelar.isPending}
          onClick={() => cancelar.mutate(undefined, { onSuccess: onCancelled })}
        >
          Cancelar orçamento
        </Button>
      )}
    </div>
  );
}
