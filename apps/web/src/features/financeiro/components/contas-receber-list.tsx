'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/states';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useContasReceber } from '../api/financeiro.queries';
import type { StatusConta } from '../api/financeiro.types';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-financeiro';
import { FinanceiroNav } from './financeiro-nav';

const PER_PAGE = 20;

export function ContasReceberList() {
  const [status, setStatus] = useState<StatusConta | undefined>(undefined);
  const [vencido, setVencido] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useContasReceber({
    status,
    vencido,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <FinanceiroNav />
      <h1 className="text-xl font-semibold">Contas a Receber</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          items={[
            { value: 'todos', label: 'Todos os status' },
            ...Object.entries(STATUS_LABEL).map(([valor, label]) => ({ value: valor, label })),
          ]}
          value={status ?? 'todos'}
          onValueChange={(v) => {
            setStatus(v === 'todos' || v === null ? undefined : (v as StatusConta));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([valor, label]) => (
              <SelectItem key={valor} value={valor}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={vencido ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setVencido((v) => !v);
            setPage(1);
          }}
        >
          Só vencidas
        </Button>
      </div>

      {isError && <ErrorState message="Não foi possível carregar as contas a receber." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      Nenhuma conta a receber encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">
                      {conta.descricao}
                      {conta.parcelaNumero && (
                        <span className="text-muted-foreground">
                          {' '}
                          ({conta.parcelaNumero}/{conta.parcelaTotal})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{conta.clienteNome ?? '—'}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Badge variant={STATUS_VARIANT[conta.status]}>
                        {STATUS_LABEL[conta.status]}
                      </Badge>
                      {conta.vencida && <Badge variant="destructive">Vencida</Badge>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(conta.valorTotal).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(conta.valorRecebido).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/financeiro/contas-receber/${conta.id}`}
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
              {data.total} conta{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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
