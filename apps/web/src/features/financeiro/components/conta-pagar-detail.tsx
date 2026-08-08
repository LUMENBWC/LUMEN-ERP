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
import { useCancelarContaPagar, useContaPagar } from '../api/financeiro.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-financeiro';
import { RegistrarPagamentoDialog } from './registrar-pagamento-dialog';

export function ContaPagarDetail({ contaPagarId }: { contaPagarId: string }) {
  const router = useRouter();
  const { data: conta, isLoading, isError } = useContaPagar(contaPagarId);
  const cancelarContaPagar = useCancelarContaPagar(contaPagarId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !conta)
    return <p className="text-destructive text-sm">Conta a pagar não encontrada.</p>;

  const saldoAberto = Number(conta.valorTotal) - Number(conta.valorPago);
  const podePagar = conta.status === 'ABERTO' || conta.status === 'PARCIAL';
  const podeCancelar = conta.status === 'ABERTO' && Number(conta.valorPago) === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{conta.descricao}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[conta.status]}>{STATUS_LABEL[conta.status]}</Badge>
            {conta.vencida && <Badge variant="destructive">Vencida</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {podeCancelar && (
            <Button
              type="button"
              variant="outline"
              className="text-destructive"
              disabled={cancelarContaPagar.isPending}
              onClick={() =>
                cancelarContaPagar.mutate(undefined, {
                  onSuccess: () => router.push('/financeiro/contas-pagar'),
                })
              }
            >
              {cancelarContaPagar.isPending ? 'Cancelando...' : 'Cancelar conta'}
            </Button>
          )}
          {podePagar && (
            <RegistrarPagamentoDialog contaPagarId={contaPagarId} saldoAberto={saldoAberto} />
          )}
        </div>
      </div>

      <div className="bg-muted flex flex-wrap gap-6 rounded-lg border p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Fornecedor</div>
          <div className="text-lg font-semibold">{conta.fornecedorNome ?? '—'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Categoria</div>
          <div className="text-lg font-semibold">{conta.categoriaDespesaNome ?? '—'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Vencimento</div>
          <div className="text-lg font-semibold">
            {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Valor total</div>
          <div className="text-lg font-semibold">R$ {conta.valorTotal}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Pago</div>
          <div className="text-lg font-semibold">R$ {conta.valorPago}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Saldo em aberto</div>
          <div className="text-lg font-semibold">R$ {saldoAberto.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Histórico de pagamentos</h2>
        {conta.pagamentos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conta.pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>R$ {pagamento.valor}</TableCell>
                    <TableCell>{pagamento.usuarioNome}</TableCell>
                    <TableCell>{new Date(pagamento.data).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
