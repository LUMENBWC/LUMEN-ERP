'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardKicker, CardValue } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/states';
import { Switch } from '@/components/ui/switch';
import { ProdutoHistoricoEstoque } from '@/features/estoque/components/produto-historico-estoque';
import { useAtualizarProduto, useDefinirAtivoProduto, useProduto } from '../api/produtos.queries';
import { formatarMoeda } from '../lib/formatar-moeda';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import { ProdutoForm } from './produto-form';

export function ProdutoDetail({ produtoId }: { produtoId: string }) {
  const { data: produto, isLoading, isError } = useProduto(produtoId);
  const atualizarProduto = useAtualizarProduto(produtoId);
  const definirAtivo = useDefinirAtivoProduto(produtoId);

  if (isLoading) return <LoadingState />;
  if (isError || !produto) return <ErrorState message="Produto não encontrado." />;

  async function handleSubmit(input: CriarProdutoInput) {
    await atualizarProduto.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/produtos"
        title={produto.nome}
        action={
          <>
            <span className="text-muted-foreground text-sm">Ativo</span>
            <Switch
              checked={produto.ativo}
              disabled={definirAtivo.isPending}
              onCheckedChange={(checked) => definirAtivo.mutate(checked)}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Card>
          <CardKicker>Margem de lucro atual</CardKicker>
          <CardValue>{(Number(produto.margemLucro) * 100).toFixed(1)}%</CardValue>
        </Card>
        <Card>
          <CardKicker>Estoque atual</CardKicker>
          <CardValue>
            {produto.estoqueAtual} {produto.unidadeMedida}
          </CardValue>
        </Card>
        <Card>
          <CardKicker>Lucro por unidade</CardKicker>
          <CardValue>
            {formatarMoeda(String(Number(produto.precoVenda) - Number(produto.precoCusto)))}
          </CardValue>
        </Card>
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
          ncm: produto.ncm,
          cfop: produto.cfop,
          cst: produto.cst,
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

      <ProdutoHistoricoEstoque produtoId={produtoId} />
    </div>
  );
}
