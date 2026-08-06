'use client';

import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useOrcamentos } from '../api/orcamentos.queries';
import type { StatusOrcamento } from '../api/orcamentos.types';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/status-orcamento';
import { useOrcamentosFiltros } from '../store/orcamentos-filtros.store';

const PER_PAGE = 20;

export function OrcamentosList() {
  const { status, page, setStatus, setPage } = useOrcamentosFiltros();
  const { data, isLoading, isError } = useOrcamentos({ status, page, perPage: PER_PAGE });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orçamentos</h1>
        <Link href="/orcamentos/novo" className={buttonVariants()}>
          Novo orçamento
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          items={[
            { value: 'todos', label: 'Todos os status' },
            ...Object.entries(STATUS_LABEL).map(([valor, label]) => ({ value: valor, label })),
          ]}
          value={status ?? 'todos'}
          onValueChange={(v) =>
            setStatus(v === 'todos' || v === null ? undefined : (v as StatusOrcamento))
          }
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
      </div>

      {isError && (
        <p className="text-destructive text-sm">Não foi possível carregar os orçamentos.</p>
      )}
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
                  <TableHead>Válido até</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">{orcamento.clienteNome}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[orcamento.status]}>
                        {STATUS_LABEL[orcamento.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{orcamento.total}</TableCell>
                    <TableCell>
                      {orcamento.validade
                        ? new Date(orcamento.validade).toLocaleDateString('pt-BR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/orcamentos/${orcamento.id}`}
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
              {data.total} orçamento{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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
