'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardKicker, CardValue } from '@/components/ui/card';
import { LoadingState } from '@/components/states';
import { Tag } from '@/components/ui/tag';
import { useCaixaAtual, useSessaoCaixa } from '../api/caixa.queries';
import { AbrirCaixaDialog } from './abrir-caixa-dialog';
import { FecharCaixaDialog } from './fechar-caixa-dialog';
import { MovimentosTabela } from './movimentos-tabela';
import { SangriaDialog } from './sangria-dialog';
import { SuprimentoDialog } from './suprimento-dialog';
import { formatarMoeda as moeda } from '@/lib/format';

export function CaixaPage() {
  const { data: sessaoAtual, isLoading: carregandoAtual } = useCaixaAtual();
  const { data: sessaoDetalhada, isLoading: carregandoDetalhe } = useSessaoCaixa(
    sessaoAtual?.id ?? '',
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Caixa"
        action={
          <Link href="/caixa/sessoes" className={buttonVariants({ variant: 'ghost' })}>
            Histórico de sessões
          </Link>
        }
      >
        {!carregandoAtual &&
          (sessaoAtual ? <Tag variant="success">Aberto</Tag> : <Tag variant="error">Fechado</Tag>)}
      </PageHeader>

      {carregandoAtual && <LoadingState />}

      {!carregandoAtual && !sessaoAtual && (
        <Card className="items-center gap-3 px-8 py-12 text-center">
          <p className="text-muted-foreground">Nenhuma sessão de caixa aberta.</p>
          <AbrirCaixaDialog />
        </Card>
      )}

      {!carregandoAtual && sessaoAtual && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              Aberto por {sessaoAtual.usuarioAberturaNome} em{' '}
              {new Date(sessaoAtual.abertoEm).toLocaleString('pt-BR')}
            </span>
            <div className="flex flex-wrap gap-2">
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
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Card>
                <CardKicker>Valor de abertura</CardKicker>
                <CardValue>{moeda(sessaoAtual.valorAbertura)}</CardValue>
              </Card>
              <Card>
                <CardKicker>Valor esperado agora</CardKicker>
                <CardValue>{moeda(sessaoDetalhada.valorEsperadoAtual)}</CardValue>
              </Card>
            </div>
          )}

          <div className="space-y-2">
            <h5 className="font-heading text-base font-semibold">Movimentos desta sessão</h5>
            {carregandoDetalhe && <LoadingState />}
            {sessaoDetalhada && <MovimentosTabela movimentos={sessaoDetalhada.movimentos} />}
          </div>
        </div>
      )}
    </div>
  );
}
