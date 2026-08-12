'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardKicker, CardTitle, CardValue } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useFluxoCaixa,
  useProdutosMaisVendidos,
  useResumoFinanceiro,
} from '../api/dashboard.queries';

function paraDataInput(iso: string): string {
  return iso.slice(0, 10);
}

/** Formata um valor decimal em string ("48230.00") como moeda pt-BR. */
function moeda(valor: string | number): string {
  const n = Number(valor);
  if (Number.isNaN(n)) return String(valor);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DashboardFinanceiro() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const params = {
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  };

  const { data: resumo, isLoading: carregandoResumo } = useResumoFinanceiro(params);
  const { data: produtos, isLoading: carregandoProdutos } = useProdutosMaisVendidos(params);
  const { data: fluxo, isLoading: carregandoFluxo } = useFluxoCaixa(params);

  const lucroPositivo = resumo ? Number(resumo.lucro) >= 0 : true;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Período</span>
            <Input
              type="date"
              value={dataInicio || (resumo ? paraDataInput(resumo.periodo.inicio) : '')}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-8 w-[150px]"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              value={dataFim || (resumo ? paraDataInput(resumo.periodo.fim) : '')}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-8 w-[150px]"
            />
          </div>
        }
      />

      {carregandoResumo && <LoadingState />}

      {resumo && (
        <>
          {/* KPIs principais */}
          <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <Card>
              <CardKicker>Faturamento</CardKicker>
              <CardValue>{moeda(resumo.faturamento)}</CardValue>
            </Card>
            <Card>
              <CardKicker>Custo dos produtos vendidos</CardKicker>
              <CardValue>{moeda(resumo.custoProdutosVendidos)}</CardValue>
            </Card>
            <Card>
              <CardKicker>Despesas pagas</CardKicker>
              <CardValue>{moeda(resumo.despesasPagas)}</CardValue>
            </Card>
            <Card elevation="sm">
              <CardKicker>Lucro</CardKicker>
              <CardValue
                className={
                  lucroPositivo ? 'text-success-foreground' : 'text-destructive-foreground'
                }
              >
                {lucroPositivo ? '+ ' : ''}
                {moeda(resumo.lucro)}
              </CardValue>
            </Card>
          </div>

          {/* Contas a receber / pagar */}
          <div className="mb-6 grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <Card>
              <CardTitle className="text-[15px]">Contas a Receber</CardTitle>
              <div className="font-heading text-[26px] font-semibold tabular-nums">
                {moeda(resumo.totalAReceber)}
              </div>
              <div className="mt-1 flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  A vencer <b className="tabular-nums">{moeda(resumo.agingReceber.aVencer)}</b>
                </span>
                <span className="text-destructive-foreground font-semibold tabular-nums">
                  Vencido {moeda(resumo.agingReceber.vencido)}
                </span>
              </div>
            </Card>
            <Card>
              <CardTitle className="text-[15px]">Contas a Pagar</CardTitle>
              <div className="font-heading text-[26px] font-semibold tabular-nums">
                {moeda(resumo.totalAPagar)}
              </div>
              <div className="mt-1 flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  A vencer <b className="tabular-nums">{moeda(resumo.agingPagar.aVencer)}</b>
                </span>
                <span className="text-destructive-foreground font-semibold tabular-nums">
                  Vencido {moeda(resumo.agingPagar.vencido)}
                </span>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Fluxo de caixa */}
      <div className="mb-6">
        <h5 className="font-heading mb-2 text-base font-semibold">Fluxo de caixa</h5>
        {carregandoFluxo && <LoadingState />}
        {fluxo && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Card>
              <CardKicker>Entradas</CardKicker>
              <div className="text-success-foreground text-[19px] font-semibold tabular-nums">
                + {moeda(fluxo.entradas)}
              </div>
            </Card>
            <Card>
              <CardKicker>Saídas</CardKicker>
              <div className="text-destructive-foreground text-[19px] font-semibold tabular-nums">
                − {moeda(fluxo.saidas)}
              </div>
            </Card>
            <Card>
              <CardKicker>Saldo</CardKicker>
              <div className="text-[19px] font-semibold tabular-nums">{moeda(fluxo.saldo)}</div>
            </Card>
          </div>
        )}
      </div>

      {/* Mais vendidos */}
      <div>
        {carregandoProdutos && <LoadingState />}
        {produtos && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-heading mb-2 text-base font-semibold">
                Mais vendidos — por quantidade
              </h5>
              <TabelaProdutos produtos={produtos.porQuantidade} coluna="quantidade" />
            </div>
            <div>
              <h5 className="font-heading mb-2 text-base font-semibold">
                Mais vendidos — por valor
              </h5>
              <TabelaProdutos produtos={produtos.porValor} coluna="valor" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabelaProdutos({
  produtos,
  coluna,
}: {
  produtos: {
    produtoId: string;
    produtoNome: string;
    quantidadeVendida: string;
    valorVendido: string;
  }[];
  coluna: 'quantidade' | 'valor';
}) {
  if (produtos.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma venda no período.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead className="text-right">
            {coluna === 'quantidade' ? 'Quantidade' : 'Valor vendido'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {produtos.map((produto) => (
          <TableRow key={produto.produtoId}>
            <TableCell>{produto.produtoNome}</TableCell>
            <TableCell className="text-right tabular-nums">
              {coluna === 'quantidade' ? produto.quantidadeVendida : moeda(produto.valorVendido)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
