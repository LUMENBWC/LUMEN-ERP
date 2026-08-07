'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useCaixaAtual, useSessaoCaixa } from '../api/caixa.queries';
import { AbrirCaixaDialog } from './abrir-caixa-dialog';
import { FecharCaixaDialog } from './fechar-caixa-dialog';
import { MovimentosTabela } from './movimentos-tabela';
import { SangriaDialog } from './sangria-dialog';
import { SuprimentoDialog } from './suprimento-dialog';

export function CaixaPage() {
  const { data: sessaoAtual, isLoading: carregandoAtual } = useCaixaAtual();
  const { data: sessaoDetalhada, isLoading: carregandoDetalhe } = useSessaoCaixa(
    sessaoAtual?.id ?? '',
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Caixa</h1>
        <Link href="/caixa/sessoes" className={buttonVariants({ variant: 'outline' })}>
          Histórico de sessões
        </Link>
      </div>

      {carregandoAtual && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {!carregandoAtual && !sessaoAtual && (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Badge variant="destructive">Caixa fechado</Badge>
          <AbrirCaixaDialog />
        </div>
      )}

      {!carregandoAtual && sessaoAtual && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Badge variant="default">Caixa aberto</Badge>
              <span className="text-muted-foreground text-sm">
                Aberto por {sessaoAtual.usuarioAberturaNome} em{' '}
                {new Date(sessaoAtual.abertoEm).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex gap-2">
              <SangriaDialog />
              <SuprimentoDialog />
              {sessaoDetalhada && (
                <FecharCaixaDialog
                  valorEsperadoAtual={Number(sessaoDetalhada.valorEsperadoAtual)}
                />
              )}
            </div>
          </div>

          {sessaoDetalhada && (
            <div className="bg-muted flex gap-6 rounded-lg border p-4 text-sm">
              <div>
                <div className="text-muted-foreground">Valor de abertura</div>
                <div className="text-lg font-semibold">R$ {sessaoAtual.valorAbertura}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Valor esperado agora</div>
                <div className="text-lg font-semibold">R$ {sessaoDetalhada.valorEsperadoAtual}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm font-medium">Movimentos desta sessão</h2>
            {carregandoDetalhe && <p className="text-muted-foreground text-sm">Carregando...</p>}
            {sessaoDetalhada && <MovimentosTabela movimentos={sessaoDetalhada.movimentos} />}
          </div>
        </div>
      )}
    </div>
  );
}
