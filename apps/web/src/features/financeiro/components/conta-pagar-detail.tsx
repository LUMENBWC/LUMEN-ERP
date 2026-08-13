'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/states';
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
import { formatarMoeda as moeda } from '@/lib/format';

export function ContaPagarDetail({ contaPagarId }: { contaPagarId: string }) {
  const router = useRouter();
  const { data: conta, isLoading, isError } = useContaPagar(contaPagarId);
  const cancelarContaPagar = useCancelarContaPagar(contaPagarId);

  if (isLoading) return <LoadingState />;
  if (isError || !conta) return <ErrorState message="Conta a pagar não encontrada." />;

  const saldoAberto = Number(conta.valorTotal) - Number(conta.valorPago);
  const podePagar = conta.status === 'ABERTO' || conta.status === 'PARCIAL';
  const podeCancelar = conta.status === 'ABERTO' && Number(conta.valorPago) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/financeiro/contas-pagar"
        title={conta.descricao}
        action={
          <>
            {podeCancelar && (
              <Button
                type="button"
                variant="destructive"
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
          </>
        }
      >
        <Badge variant={STATUS_VARIANT[conta.status]}>{STATUS_LABEL[conta.status]}</Badge>
        {conta.vencida && <Badge variant="destructive">Vencida</Badge>}
      </PageHeader>

      <Card className="flex-row flex-wrap gap-x-8 gap-y-4 p-4 text-sm">
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
          <div className="text-lg font-semibold tabular-nums">{moeda(conta.valorTotal)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Pago</div>
          <div className="text-lg font-semibold tabular-nums">{moeda(conta.valorPago)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Saldo em aberto</div>
          <div className="text-lg font-semibold tabular-nums">{moeda(saldoAberto)}</div>
        </div>
      </Card>

      <div className="space-y-2">
        <h5 className="font-heading text-base font-semibold">Histórico de pagamentos</h5>
        {conta.pagamentos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conta.pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell className="text-right tabular-nums">
                      {moeda(pagamento.valor)}
                    </TableCell>
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
