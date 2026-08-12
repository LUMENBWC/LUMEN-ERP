'use client';

import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
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
  const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-4">
      <PageHeader title="PDV — Frente de caixa">
        {!caixaCarregando &&
          (caixa ? (
            <Tag variant="success">Caixa aberto — {moeda(Number(caixa.valorAbertura))}</Tag>
          ) : (
            <div className="flex items-center gap-2">
              <Tag variant="error">Caixa fechado</Tag>
              <AbrirCaixaDialog />
            </div>
          ))}
      </PageHeader>

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

          <Card elevation="sm" className="gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{moeda(subtotal)}</span>
            </div>
            <div className="font-heading flex justify-between text-xl font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{moeda(total)}</span>
            </div>
          </Card>

          <FinalizarVendaDialog total={total} />
        </div>
      </div>
    </div>
  );
}
