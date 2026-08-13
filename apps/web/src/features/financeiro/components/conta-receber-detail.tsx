'use client';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
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
import { FORMA_PAGAMENTO_LABEL } from '@/features/vendas/lib/labels-venda';
import { useContaReceber } from '../api/financeiro.queries';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/labels-financeiro';
import { RegistrarRecebimentoDialog } from './registrar-recebimento-dialog';
import { formatarMoeda as moeda } from '@/lib/format';

export function ContaReceberDetail({ contaReceberId }: { contaReceberId: string }) {
  const { data: conta, isLoading, isError } = useContaReceber(contaReceberId);

  if (isLoading) return <LoadingState />;
  if (isError || !conta) return <ErrorState message="Conta a receber não encontrada." />;

  const saldoAberto = Number(conta.valorTotal) - Number(conta.valorRecebido);
  const podeReceber = conta.status === 'ABERTO' || conta.status === 'PARCIAL';

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/financeiro/contas-receber"
        title={conta.descricao}
        action={
          podeReceber && (
            <RegistrarRecebimentoDialog contaReceberId={contaReceberId} saldoAberto={saldoAberto} />
          )
        }
      >
        <Badge variant={STATUS_VARIANT[conta.status]}>{STATUS_LABEL[conta.status]}</Badge>
        {conta.vencida && <Badge variant="destructive">Vencida</Badge>}
      </PageHeader>

      <Card className="flex-row flex-wrap gap-x-8 gap-y-4 p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Cliente</div>
          <div className="text-lg font-semibold">{conta.clienteNome ?? '—'}</div>
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
          <div className="text-muted-foreground">Recebido</div>
          <div className="text-lg font-semibold tabular-nums">{moeda(conta.valorRecebido)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Saldo em aberto</div>
          <div className="text-lg font-semibold tabular-nums">{moeda(saldoAberto)}</div>
        </div>
      </Card>

      <div className="space-y-2">
        <h5 className="font-heading text-base font-semibold">Histórico de recebimentos</h5>
        {conta.recebimentos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum recebimento registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conta.recebimentos.map((recebimento) => (
                  <TableRow key={recebimento.id}>
                    <TableCell className="text-right tabular-nums">
                      {moeda(recebimento.valor)}
                    </TableCell>
                    <TableCell>{FORMA_PAGAMENTO_LABEL[recebimento.formaPagamento]}</TableCell>
                    <TableCell>{recebimento.usuarioNome}</TableCell>
                    <TableCell>{new Date(recebimento.data).toLocaleString('pt-BR')}</TableCell>
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
