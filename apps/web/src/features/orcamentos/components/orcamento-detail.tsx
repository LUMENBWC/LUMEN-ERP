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
import {
  useAtualizarOrcamento,
  useGerarPdfOrcamento,
  useOrcamento,
} from '../api/orcamentos.queries';
import type { CriarOrcamentoInput } from '../schemas/orcamento.schema';
import { STATUS_LABEL, STATUS_VARIANT } from '../lib/status-orcamento';
import { OrcamentoForm } from './orcamento-form';
import { OrcamentoStatusActions } from './orcamento-status-actions';

export function OrcamentoDetail({ orcamentoId }: { orcamentoId: string }) {
  const router = useRouter();
  const { data: orcamento, isLoading, isError } = useOrcamento(orcamentoId);
  const atualizarOrcamento = useAtualizarOrcamento(orcamentoId);
  const gerarPdf = useGerarPdfOrcamento(orcamentoId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !orcamento)
    return <p className="text-destructive text-sm">Orçamento não encontrado.</p>;

  async function handleSubmit(input: CriarOrcamentoInput) {
    await atualizarOrcamento.mutateAsync(input);
  }

  async function handleBaixarPdf() {
    const novaAba = window.open('', '_blank');
    try {
      const { url } = await gerarPdf.mutateAsync();
      if (novaAba) {
        novaAba.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      novaAba?.close();
    }
  }

  const editavel = orcamento.status === 'RASCUNHO';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Orçamento - {orcamento.clienteNome}</h1>
          <Badge variant={STATUS_VARIANT[orcamento.status]} className="mt-1">
            {STATUS_LABEL[orcamento.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={gerarPdf.isPending}
            onClick={handleBaixarPdf}
          >
            {gerarPdf.isPending ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
          <OrcamentoStatusActions
            orcamento={orcamento}
            onCancelled={() => router.push('/orcamentos')}
          />
        </div>
      </div>

      {editavel ? (
        <OrcamentoForm
          defaultValues={{
            clienteId: orcamento.clienteId,
            itens: orcamento.itens.map((item) => ({
              produtoId: item.produtoId,
              produtoNome: item.produtoNome,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
              desconto: Number(item.desconto),
            })),
            descontoGeral: Number(orcamento.descontoGeral),
            validade: orcamento.validade,
            observacoes: orcamento.observacoes,
          }}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          error={atualizarOrcamento.error}
          isPending={atualizarOrcamento.isPending}
        />
      ) : (
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
                {orcamento.itens.map((item) => (
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
              <div className="text-lg font-semibold">{orcamento.subtotal}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Desconto geral</div>
              <div className="text-lg font-semibold">{orcamento.descontoGeral}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">{orcamento.total}</div>
            </div>
          </div>
          {orcamento.observacoes && (
            <p className="text-muted-foreground text-sm">{orcamento.observacoes}</p>
          )}
          <p className="text-muted-foreground text-xs">
            Só é possível editar um orçamento enquanto ele está em rascunho.
          </p>
        </div>
      )}
    </div>
  );
}
