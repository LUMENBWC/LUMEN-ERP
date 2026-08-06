'use client';

import { Switch } from '@/components/ui/switch';
import { useAtualizarProduto, useDefinirAtivoProduto, useProduto } from '../api/produtos.queries';
import { formatarMoeda } from '../lib/formatar-moeda';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import { ProdutoForm } from './produto-form';

export function ProdutoDetail({ produtoId }: { produtoId: string }) {
  const { data: produto, isLoading, isError } = useProduto(produtoId);
  const atualizarProduto = useAtualizarProduto(produtoId);
  const definirAtivo = useDefinirAtivoProduto(produtoId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !produto)
    return <p className="text-destructive text-sm">Produto não encontrado.</p>;

  async function handleSubmit(input: CriarProdutoInput) {
    await atualizarProduto.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{produto.nome}</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Ativo</span>
          <Switch
            checked={produto.ativo}
            disabled={definirAtivo.isPending}
            onCheckedChange={(checked) => definirAtivo.mutate(checked)}
          />
        </div>
      </div>

      <div className="bg-muted flex gap-6 rounded-lg border p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Margem de lucro atual</div>
          <div className="text-lg font-semibold">
            {(Number(produto.margemLucro) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Estoque atual</div>
          <div className="text-lg font-semibold">
            {produto.estoqueAtual} {produto.unidadeMedida}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Lucro por unidade</div>
          <div className="text-lg font-semibold">
            {formatarMoeda(String(Number(produto.precoVenda) - Number(produto.precoCusto)))}
          </div>
        </div>
      </div>

      <ProdutoForm
        defaultValues={{
          nome: produto.nome,
          descricao: produto.descricao,
          sku: produto.sku,
          codigoBarras: produto.codigoBarras,
          unidadeMedida: produto.unidadeMedida,
          categoriaId: produto.categoriaId,
          precoCusto: Number(produto.precoCusto),
          precoVenda: Number(produto.precoVenda),
          estoqueMinimo: Number(produto.estoqueMinimo),
        }}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        error={atualizarProduto.error}
        isPending={atualizarProduto.isPending}
      />

      <p className="text-muted-foreground text-xs">
        Estoque atual não é editável aqui - só muda via movimentações de estoque (entrada, saída,
        ajuste, perda).
      </p>
    </div>
  );
}
