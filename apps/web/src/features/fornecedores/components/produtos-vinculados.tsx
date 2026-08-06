'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVincularProduto, useDesvincularProduto } from '../api/fornecedores.queries';
import type { ProdutoVinculado } from '../api/fornecedores.types';
import { useProdutos } from '@/features/produtos/api/produtos.queries';

export function ProdutosVinculados({
  fornecedorId,
  produtos,
}: {
  fornecedorId: string;
  produtos: ProdutoVinculado[];
}) {
  const [novoProdutoId, setNovoProdutoId] = useState('');
  const { data: todosProdutos } = useProdutos({ ativo: true, page: 1, perPage: 100 });
  const vincular = useVincularProduto(fornecedorId);
  const desvincular = useDesvincularProduto(fornecedorId);

  const idsVinculados = new Set(produtos.map((p) => p.produtoId));
  const disponiveis = (todosProdutos?.items ?? []).filter((p) => !idsVinculados.has(p.id));

  async function handleVincular() {
    if (!novoProdutoId) return;
    await vincular.mutateAsync(novoProdutoId);
    setNovoProdutoId('');
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Produtos fornecidos</h2>

      <div className="flex flex-wrap gap-2">
        {produtos.map((produto) => (
          <Badge key={produto.produtoId} variant="secondary" className="gap-1.5">
            {produto.produtoNome} ({produto.produtoSku})
            <button
              type="button"
              aria-label={`Desvincular ${produto.produtoNome}`}
              className="hover:text-destructive"
              disabled={desvincular.isPending}
              onClick={() => desvincular.mutate(produto.produtoId)}
            >
              ×
            </button>
          </Badge>
        ))}
        {produtos.length === 0 && (
          <span className="text-muted-foreground text-sm">Nenhum produto vinculado.</span>
        )}
      </div>

      {disponiveis.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            items={disponiveis.map((p) => ({ value: p.id, label: `${p.nome} (${p.sku})` }))}
            value={novoProdutoId}
            onValueChange={(v) => setNovoProdutoId(v ?? '')}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Vincular produto..." />
            </SelectTrigger>
            <SelectContent>
              {disponiveis.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome} ({p.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!novoProdutoId || vincular.isPending}
            onClick={handleVincular}
          >
            Vincular
          </Button>
        </div>
      )}
    </div>
  );
}
