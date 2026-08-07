'use client';

import { Badge } from '@/components/ui/badge';
import { useSessaoCaixa } from '../api/caixa.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-caixa';
import { MovimentosTabela } from './movimentos-tabela';

export function SessaoDetail({ sessaoId }: { sessaoId: string }) {
  const { data: sessao, isLoading, isError } = useSessaoCaixa(sessaoId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !sessao)
    return <p className="text-destructive text-sm">Sessão de caixa não encontrada.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sessão de caixa - {sessao.usuarioAberturaNome}</h1>
        <Badge variant={STATUS_VARIANT[sessao.status]} className="mt-1">
          {STATUS_LABEL[sessao.status]}
        </Badge>
      </div>

      <div className="bg-muted flex flex-wrap gap-6 rounded-lg border p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Aberto em</div>
          <div className="text-lg font-semibold">
            {new Date(sessao.abertoEm).toLocaleString('pt-BR')}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Valor de abertura</div>
          <div className="text-lg font-semibold">R$ {sessao.valorAbertura}</div>
        </div>
        {sessao.status === 'FECHADO' ? (
          <>
            <div>
              <div className="text-muted-foreground">Fechado em</div>
              <div className="text-lg font-semibold">
                {sessao.fechadoEm ? new Date(sessao.fechadoEm).toLocaleString('pt-BR') : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Valor esperado</div>
              <div className="text-lg font-semibold">R$ {sessao.valorFechamentoEsperado}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Valor informado</div>
              <div className="text-lg font-semibold">R$ {sessao.valorFechamentoInformado}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Diferença</div>
              <div className="text-lg font-semibold">R$ {sessao.diferenca}</div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-muted-foreground">Valor esperado agora</div>
            <div className="text-lg font-semibold">R$ {sessao.valorEsperadoAtual}</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Movimentos</h2>
        <MovimentosTabela movimentos={sessao.movimentos} />
      </div>
    </div>
  );
}
