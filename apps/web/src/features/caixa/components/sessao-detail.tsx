'use client';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/states';
import { useSessaoCaixa } from '../api/caixa.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-caixa';
import { MovimentosTabela } from './movimentos-tabela';

const moeda = (v: string | number | null | undefined) =>
  v === null || v === undefined
    ? '—'
    : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function SessaoDetail({ sessaoId }: { sessaoId: string }) {
  const { data: sessao, isLoading, isError } = useSessaoCaixa(sessaoId);

  if (isLoading) return <LoadingState />;
  if (isError || !sessao) return <ErrorState message="Sessão de caixa não encontrada." />;

  return (
    <div className="space-y-6">
      <PageHeader title={`Sessão de caixa — ${sessao.usuarioAberturaNome}`}>
        <Badge variant={STATUS_VARIANT[sessao.status]}>{STATUS_LABEL[sessao.status]}</Badge>
      </PageHeader>

      <Card className="flex-row flex-wrap gap-x-8 gap-y-4 p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Aberto em</div>
          <div className="text-lg font-semibold">
            {new Date(sessao.abertoEm).toLocaleString('pt-BR')}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Valor de abertura</div>
          <div className="text-lg font-semibold tabular-nums">{moeda(sessao.valorAbertura)}</div>
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
              <div className="text-lg font-semibold tabular-nums">
                {moeda(sessao.valorFechamentoEsperado)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Valor informado</div>
              <div className="text-lg font-semibold tabular-nums">
                {moeda(sessao.valorFechamentoInformado)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Diferença</div>
              <div className="text-lg font-semibold tabular-nums">{moeda(sessao.diferenca)}</div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-muted-foreground">Valor esperado agora</div>
            <div className="text-lg font-semibold tabular-nums">
              {moeda(sessao.valorEsperadoAtual)}
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-2">
        <h5 className="font-heading text-base font-semibold">Movimentos</h5>
        <MovimentosTabela movimentos={sessao.movimentos} />
      </div>
    </div>
  );
}
