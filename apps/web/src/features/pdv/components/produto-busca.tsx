'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useProdutos } from '@/features/produtos/api/produtos.queries';
import type { ProdutoResumo } from '@/features/produtos/api/produtos.types';
import { useCarrinho } from '../store/carrinho.store';

export function ProdutoBusca() {
  const [busca, setBusca] = useState('');
  const { data } = useProdutos({ busca: busca || undefined, ativo: true, page: 1, perPage: 50 });
  const adicionarItem = useCarrinho((state) => state.adicionarItem);

  function adicionar(produto: ProdutoResumo) {
    adicionarItem({
      produtoId: produto.id,
      produtoNome: produto.nome,
      quantidade: 1,
      precoUnitario: Number(produto.precoVenda),
      desconto: 0,
    });
    setBusca('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !data) return;
    event.preventDefault();
    const porCodigoBarras = data.items.find((p) => p.codigoBarras === busca);
    const produto = porCodigoBarras ?? (data.items.length === 1 ? data.items[0] : undefined);
    if (produto) adicionar(produto);
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Buscar por nome, SKU ou código de barras..."
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      {data && data.items.length > 0 && (
        <div className="border-border max-h-64 overflow-y-auto border">
          {data.items.map((produto) => (
            <button
              key={produto.id}
              type="button"
              onClick={() => adicionar(produto)}
              className="hover:bg-muted flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0"
            >
              <span>
                {produto.nome} <span className="text-muted-foreground">({produto.sku})</span>
              </span>
              <span className="text-muted-foreground">R$ {produto.precoVenda}</span>
            </button>
          ))}
        </div>
      )}
      {data && data.items.length === 0 && (
        <p className="text-muted-foreground text-sm">Nenhum produto encontrado.</p>
      )}
    </div>
  );
}
