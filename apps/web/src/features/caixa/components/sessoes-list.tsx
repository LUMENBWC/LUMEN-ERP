'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Histórico de sessões de caixa</h1>
        <Link href="/caixa" className={buttonVariants({ variant: 'outline' })}>
          Voltar
        </Link>
      </div>

      {isError && <p className="text-destructive text-sm">Não foi possível carregar as sessões.</p>}
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aberto por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor de abertura</TableHead>
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
                    <TableCell>R$ {sessao.valorAbertura}</TableCell>
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
