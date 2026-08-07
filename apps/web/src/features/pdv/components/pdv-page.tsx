'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCaixaAtual } from '@/features/caixa/api/caixa.queries';
import { AbrirCaixaDialog } from '@/features/caixa/components/abrir-caixa-dialog';
import { useClientes } from '@/features/clientes/api/clientes.queries';
import { CarrinhoTabela } from './carrinho-tabela';
import { FinalizarVendaDialog } from './finalizar-venda-dialog';
import { ProdutoBusca } from './produto-busca';
import { useCarrinho } from '../store/carrinho.store';

export function PdvPage() {
  const { data: caixa, isLoading: caixaCarregando } = useCaixaAtual();
  const { data: clientes } = useClientes({ ativo: true, page: 1, perPage: 100 });
  const clienteId = useCarrinho((state) => state.clienteId);
  const setCliente = useCarrinho((state) => state.setCliente);
  const itens = useCarrinho((state) => state.itens);
  const descontoGeral = useCarrinho((state) => state.descontoGeral);
  const setDescontoGeral = useCarrinho((state) => state.setDescontoGeral);

  const subtotal = itens.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnitario - item.desconto,
    0,
  );
  const total = Math.max(subtotal - descontoGeral, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">PDV — Frente de caixa</h1>
        {!caixaCarregando && (
          <div className="flex items-center gap-2">
            {caixa ? (
              <Badge variant="default">Caixa aberto — R$ {caixa.valorAbertura}</Badge>
            ) : (
              <>
                <Badge variant="destructive">Caixa fechado</Badge>
                <AbrirCaixaDialog />
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ProdutoBusca />
          <CarrinhoTabela />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cliente">Cliente (opcional)</Label>
            <Select
              items={[
                { value: 'nenhum', label: 'Sem cliente' },
                ...(clientes?.items ?? []).map((c) => ({ value: c.id, label: c.nome })),
              ]}
              value={clienteId ?? 'nenhum'}
              onValueChange={(v) => {
                if (!v || v === 'nenhum') {
                  setCliente(null, null);
                  return;
                }
                const cliente = clientes?.items.find((c) => c.id === v);
                setCliente(v, cliente?.nome ?? null);
              }}
            >
              <SelectTrigger id="cliente" className="w-full">
                <SelectValue placeholder="Sem cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem cliente</SelectItem>
                {clientes?.items.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="descontoGeral">Desconto geral</Label>
            <Input
              id="descontoGeral"
              type="number"
              step="0.01"
              min="0"
              value={descontoGeral}
              onChange={(event) => setDescontoGeral(Number(event.target.value) || 0)}
            />
          </div>

          <div className="bg-muted space-y-2 rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <FinalizarVendaDialog total={total} />
        </div>
      </div>
    </div>
  );
}
