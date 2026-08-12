'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/states';
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

  if (isLoading) return <LoadingState />;
  if (isError || !venda) return <ErrorState message="Venda não encontrada." />;

  const cancelavel = venda.status === 'CONCLUIDA';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Venda — ${venda.clienteNome ?? 'Consumidor final'}`}
        action={
          cancelavel && (
            <Button
              type="button"
              variant="destructive"
              disabled={cancelarVenda.isPending}
              onClick={() => cancelarVenda.mutate(undefined, { onSuccess: () => router.refresh() })}
            >
              {cancelarVenda.isPending ? 'Cancelando...' : 'Cancelar venda'}
            </Button>
          )
        }
      >
        <Badge variant={STATUS_VARIANT[venda.status]}>{STATUS_LABEL[venda.status]}</Badge>
      </PageHeader>

      <div className="max-w-3xl space-y-4">
        <div className="overflow-x-auto">
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

        <div className="border-border flex flex-wrap gap-x-8 gap-y-4 border p-4 text-sm">
          <div>
            <div className="text-muted-foreground">Subtotal</div>
            <div className="text-lg font-semibold tabular-nums">
              {Number(venda.subtotal).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Desconto geral</div>
            <div className="text-lg font-semibold tabular-nums">
              {Number(venda.descontoGeral).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Total</div>
            <div className="text-lg font-semibold tabular-nums">
              {Number(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-heading text-base font-semibold">Pagamentos</h5>
          <div className="overflow-x-auto">
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
