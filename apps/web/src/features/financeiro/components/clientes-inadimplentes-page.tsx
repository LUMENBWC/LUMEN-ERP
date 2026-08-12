'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClientesInadimplentes } from '../api/financeiro.queries';
import { FinanceiroNav } from './financeiro-nav';

const PER_PAGE = 20;

function diasEmAtraso(vencimento: string): number {
  const umDiaMs = 24 * 60 * 60 * 1000;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVencimento = new Date(vencimento);
  dataVencimento.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoje.getTime() - dataVencimento.getTime()) / umDiaMs));
}

export function ClientesInadimplentesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useClientesInadimplentes({ page, perPage: PER_PAGE });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <FinanceiroNav />
      <PageHeader
        title="Clientes inadimplentes"
        description="Clientes com contas a receber vencidas, ordenados pelo maior valor em aberto."
      />

      {isError && <ErrorState message="Não foi possível carregar os inadimplentes." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total vencido</TableHead>
                  <TableHead className="text-right">Títulos</TableHead>
                  <TableHead>Vencido há</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      Nenhum cliente inadimplente no momento.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((cliente) => (
                  <TableRow key={cliente.clienteId}>
                    <TableCell className="font-medium">{cliente.clienteNome}</TableCell>
                    <TableCell className="text-destructive-foreground text-right font-medium tabular-nums">
                      {Number(cliente.totalVencido).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {cliente.quantidadeTitulos}
                    </TableCell>
                    <TableCell>{diasEmAtraso(cliente.vencimentoMaisAntigo)} dias</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clientes/${cliente.clienteId}`} className="text-sm underline">
                        Ver cliente
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} cliente{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPaginas}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
