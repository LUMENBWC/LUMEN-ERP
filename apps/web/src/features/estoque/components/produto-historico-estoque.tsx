'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMovimentacoes } from '../api/estoque.queries';
import type { TipoMovimentacao } from '../api/estoque.types';

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

export function ProdutoHistoricoEstoque({ produtoId }: { produtoId: string }) {
  const { data, isLoading } = useMovimentacoes({ produtoId, page: 1, perPage: 10 });

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Histórico de movimentações</h2>
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
      {data && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Saldo após</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center">
                    Nenhuma movimentação registrada ainda.
                  </TableCell>
                </TableRow>
              )}
              {data.items.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{new Date(mov.data).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={TIPO_VARIANT[mov.tipo]}>{TIPO_LABEL[mov.tipo]}</Badge>
                  </TableCell>
                  <TableCell>{mov.quantidade}</TableCell>
                  <TableCell>{mov.saldoApos}</TableCell>
                  <TableCell className="text-muted-foreground">{mov.motivo ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
