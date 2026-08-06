'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMovimentacoes } from '@/features/estoque/api/estoque.queries';

export function FornecedorHistoricoCompras({ fornecedorId }: { fornecedorId: string }) {
  const { data, isLoading } = useMovimentacoes({
    fornecedorId,
    tipo: 'ENTRADA_COMPRA',
    page: 1,
    perPage: 10,
  });

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Histórico de compras</h2>
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
      {data && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo unitário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center">
                    Nenhuma compra registrada ainda.
                  </TableCell>
                </TableRow>
              )}
              {data.items.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{new Date(mov.data).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{mov.produtoNome}</TableCell>
                  <TableCell>{mov.quantidade}</TableCell>
                  <TableCell>{mov.custoUnitario ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
