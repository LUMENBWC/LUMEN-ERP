'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { ErrorState, TableSkeleton } from '@/components/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVendas } from '../api/vendas.queries';
import type { StatusVenda } from '../api/vendas.types';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-venda';

const PER_PAGE = 20;

export function VendasList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusVenda | undefined>(undefined);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const { data, isLoading, isError } = useVendas({
    page,
    perPage: PER_PAGE,
    status,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;
  const temFiltro = status !== undefined || dataInicio !== '' || dataFim !== '';

  function limparFiltros() {
    setStatus(undefined);
    setDataInicio('');
    setDataFim('');
    setPage(1);
  }

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

      {/* Filtros que o backend já suportava desde a criação do módulo
          (listar-vendas.query.dto.ts) e que nunca tinham sido expostos. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            items={[
              { value: 'todos', label: 'Todos os status' },
              ...Object.entries(STATUS_LABEL).map(([valor, label]) => ({ value: valor, label })),
            ]}
            value={status ?? 'todos'}
            onValueChange={(v) => {
              setStatus(v === 'todos' || v === null ? undefined : (v as StatusVenda));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
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
        <div className="space-y-1">
          <Label htmlFor="dataInicio" className="text-xs">
            De
          </Label>
          <Input
            id="dataInicio"
            type="date"
            className="w-40"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dataFim" className="text-xs">
            Até
          </Label>
          <Input
            id="dataFim"
            type="date"
            className="w-40"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {temFiltro && (
          <Button type="button" variant="ghost" size="sm" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        )}
      </div>

      {isError && <ErrorState message="Não foi possível carregar as vendas." />}
      {isLoading && <TableSkeleton columns={7} />}

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
                      {temFiltro
                        ? 'Nenhuma venda para estes filtros.'
                        : 'Nenhuma venda registrada ainda.'}
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
