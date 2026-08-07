'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vendas</h1>
        <Link href="/pdv" className={buttonVariants()}>
          Nova venda
        </Link>
      </div>

      {isError && <p className="text-destructive text-sm">Não foi possível carregar as vendas.</p>}
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
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
                    <TableCell>{venda.total}</TableCell>
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
