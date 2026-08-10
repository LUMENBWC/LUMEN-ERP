'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function StatCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: 'positivo' | 'negativo';
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">{titulo}</div>
      <div
        className={
          destaque === 'positivo'
            ? 'text-lg font-semibold text-green-600'
            : destaque === 'negativo'
              ? 'text-destructive text-lg font-semibold'
              : 'text-lg font-semibold'
        }
      >
        R$ {valor}
      </div>
    </div>
  );
}

function TabelaProdutos({
  produtos,
  colunaValor,
}: {
  produtos: {
    produtoId: string;
    produtoNome: string;
    quantidadeVendida: string;
    valorVendido: string;
  }[];
  colunaValor: 'quantidade' | 'valor';
}) {
  if (produtos.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma venda no período.</p>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>{colunaValor === 'quantidade' ? 'Quantidade' : 'Valor vendido'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.produtoId}>
              <TableCell className="font-medium">{produto.produtoNome}</TableCell>
              <TableCell>
                {colunaValor === 'quantidade'
                  ? produto.quantidadeVendida
                  : `R$ ${produto.valorVendido}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resumo financeiro</h2>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="dataInicio" className="text-xs">
              De
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio || (resumo ? paraDataInput(resumo.periodo.inicio) : '')}
              onChange={(event) => setDataInicio(event.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dataFim" className="text-xs">
              Até
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim || (resumo ? paraDataInput(resumo.periodo.fim) : '')}
              onChange={(event) => setDataFim(event.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {carregandoResumo && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {resumo && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard titulo="Faturamento" valor={resumo.faturamento} />
            <StatCard titulo="Custo dos produtos vendidos" valor={resumo.custoProdutosVendidos} />
            <StatCard titulo="Despesas pagas" valor={resumo.despesasPagas} />
            <StatCard
              titulo="Lucro"
              valor={resumo.lucro}
              destaque={Number(resumo.lucro) >= 0 ? 'positivo' : 'negativo'}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">A receber</span>
                <span className="text-lg font-semibold">R$ {resumo.totalAReceber}</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>A vencer: R$ {resumo.agingReceber.aVencer}</span>
                <span className="text-destructive">Vencido: R$ {resumo.agingReceber.vencido}</span>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">A pagar</span>
                <span className="text-lg font-semibold">R$ {resumo.totalAPagar}</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>A vencer: R$ {resumo.agingPagar.aVencer}</span>
                <span className="text-destructive">Vencido: R$ {resumo.agingPagar.vencido}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Fluxo de caixa</h2>
        {carregandoFluxo && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {fluxo && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard titulo="Entradas" valor={fluxo.entradas} destaque="positivo" />
            <StatCard titulo="Saídas" valor={fluxo.saidas} destaque="negativo" />
            <StatCard
              titulo="Saldo"
              valor={fluxo.saldo}
              destaque={Number(fluxo.saldo) >= 0 ? 'positivo' : 'negativo'}
            />
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Produtos mais vendidos</h2>
        {carregandoProdutos && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {produtos && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-muted-foreground mb-1 text-sm">Por quantidade</h3>
              <TabelaProdutos produtos={produtos.porQuantidade} colunaValor="quantidade" />
            </div>
            <div>
              <h3 className="text-muted-foreground mb-1 text-sm">Por valor</h3>
              <TabelaProdutos produtos={produtos.porValor} colunaValor="valor" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
