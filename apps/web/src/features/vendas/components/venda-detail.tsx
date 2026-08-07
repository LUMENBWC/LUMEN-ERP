'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCancelarVenda, useVenda } from '../api/vendas.queries';
import { FORMA_PAGAMENTO_LABEL, STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-venda';

export function VendaDetail({ vendaId }: { vendaId: string }) {
  const router = useRouter();
  const { data: venda, isLoading, isError } = useVenda(vendaId);
  const cancelarVenda = useCancelarVenda(vendaId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !venda) return <p className="text-destructive text-sm">Venda não encontrada.</p>;

  const cancelavel = venda.status === 'CONCLUIDA';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Venda — {venda.clienteNome ?? 'Consumidor final'}
          </h1>
          <Badge variant={STATUS_VARIANT[venda.status]} className="mt-1">
            {STATUS_LABEL[venda.status]}
          </Badge>
        </div>
        {cancelavel && (
          <Button
            type="button"
            variant="outline"
            className="text-destructive"
            disabled={cancelarVenda.isPending}
            onClick={() => cancelarVenda.mutate(undefined, { onSuccess: () => router.refresh() })}
          >
            {cancelarVenda.isPending ? 'Cancelando...' : 'Cancelar venda'}
          </Button>
        )}
      </div>

      <div className="max-w-3xl space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Preço unit.</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venda.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.produtoNome}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.precoUnitario}</TableCell>
                  <TableCell>{item.desconto}</TableCell>
                  <TableCell>{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted flex gap-6 rounded-lg border p-4 text-sm">
          <div>
            <div className="text-muted-foreground">Subtotal</div>
            <div className="text-lg font-semibold">{venda.subtotal}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Desconto geral</div>
            <div className="text-lg font-semibold">{venda.descontoGeral}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">{venda.total}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium">Pagamentos</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Parcelas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venda.pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>{FORMA_PAGAMENTO_LABEL[pagamento.formaPagamento]}</TableCell>
                    <TableCell>{pagamento.valor}</TableCell>
                    <TableCell>{pagamento.parcelas ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
