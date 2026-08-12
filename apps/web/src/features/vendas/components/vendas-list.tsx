'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useVendas } from '../api/vendas.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-venda';

const PER_PAGE = 20;

export function VendasList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useVendas({ page, perPage: PER_PAGE });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vendas"
        action={
          <Link href="/pdv" className={buttonVariants()}>
            Nova venda
          </Link>
        }
      />

      {isError && <ErrorState message="Não foi possível carregar as vendas." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      Nenhuma venda encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">
                      {venda.clienteNome ?? 'Consumidor final'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[venda.status]}>
                        {STATUS_LABEL[venda.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(venda.total).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{venda.usuarioNome}</TableCell>
                    <TableCell>{new Date(venda.createdAt).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/vendas/${venda.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} venda{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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
