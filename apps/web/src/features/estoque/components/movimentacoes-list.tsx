'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
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
import { useProdutos } from '@/features/produtos/api/produtos.queries';
import { useMovimentacoes } from '../api/estoque.queries';
import type { TipoMovimentacao } from '../api/estoque.types';
import { AjusteDialog } from './ajuste-dialog';
import { EntradaDialog } from './entrada-dialog';
import { PerdaDialog } from './perda-dialog';

const PER_PAGE = 20;

const TIPO_LABEL: Record<TipoMovimentacao, string> = {
  ENTRADA_COMPRA: 'Entrada (compra)',
  SAIDA_VENDA: 'Saída (venda)',
  AJUSTE_MANUAL: 'Ajuste manual',
  PERDA: 'Perda',
};

const TIPO_VARIANT: Record<TipoMovimentacao, 'default' | 'destructive' | 'secondary'> = {
  ENTRADA_COMPRA: 'default',
  SAIDA_VENDA: 'secondary',
  AJUSTE_MANUAL: 'secondary',
  PERDA: 'destructive',
};

export function MovimentacoesList() {
  const [produtoId, setProdutoId] = useState<string | undefined>(undefined);
  const [tipo, setTipo] = useState<TipoMovimentacao | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: produtos } = useProdutos({ ativo: true, page: 1, perPage: 100 });
  const { data, isLoading, isError } = useMovimentacoes({
    produtoId,
    tipo,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Estoque"
        action={
          <>
            <EntradaDialog trigger={<Button>Nova entrada</Button>} />
            <AjusteDialog trigger={<Button variant="outline">Ajuste</Button>} />
            <PerdaDialog trigger={<Button variant="outline">Perda</Button>} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          items={[
            { value: 'todos', label: 'Todos os produtos' },
            ...(produtos?.items ?? []).map((p) => ({ value: p.id, label: p.nome })),
          ]}
          value={produtoId ?? 'todos'}
          onValueChange={(v) => {
            setProdutoId(v === 'todos' || v === null ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os produtos</SelectItem>
            {produtos?.items.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={[
            { value: 'todos', label: 'Todos os tipos' },
            ...Object.entries(TIPO_LABEL).map(([valor, label]) => ({ value: valor, label })),
          ]}
          value={tipo ?? 'todos'}
          onValueChange={(v) => {
            setTipo(v === 'todos' || v === null ? undefined : (v as TipoMovimentacao));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {Object.entries(TIPO_LABEL).map(([valor, label]) => (
              <SelectItem key={valor} value={valor}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && <ErrorState message="Não foi possível carregar as movimentações." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Saldo após</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{new Date(mov.data).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{mov.produtoNome}</TableCell>
                    <TableCell>
                      <Badge variant={TIPO_VARIANT[mov.tipo]}>{TIPO_LABEL[mov.tipo]}</Badge>
                    </TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell>{mov.saldoApos}</TableCell>
                    <TableCell>{mov.usuarioNome}</TableCell>
                    <TableCell className="text-muted-foreground">{mov.motivo ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} movimentaç{data.total === 1 ? 'ão' : 'ões'} - página {page} de{' '}
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
