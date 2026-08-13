'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { useSessoesCaixa } from '../api/caixa.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-caixa';

const PER_PAGE = 20;

export function SessoesList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSessoesCaixa({ page, perPage: PER_PAGE });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader backHref="/caixa" title="Histórico de sessões de caixa" />

      {isError && <ErrorState message="Não foi possível carregar as sessões." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aberto por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor de abertura</TableHead>
                  <TableHead>Aberto em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      Nenhuma sessão encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((sessao) => (
                  <TableRow key={sessao.id}>
                    <TableCell className="font-medium">{sessao.usuarioAberturaNome}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[sessao.status]}>
                        {STATUS_LABEL[sessao.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(sessao.valorAbertura).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{new Date(sessao.abertoEm).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/caixa/sessoes/${sessao.id}`}
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
              {data.total} {data.total === 1 ? 'sessão' : 'sessões'} - página {page} de{' '}
              {totalPaginas}
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
