'use client';

import { useRouter } from 'next/navigation';
import { useCriarProduto } from '../api/produtos.queries';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import { ProdutoForm } from './produto-form';

export function CriarProdutoPage() {
  const router = useRouter();
  const criarProduto = useCriarProduto();

  async function handleSubmit(input: CriarProdutoInput) {
    const produto = await criarProduto.mutateAsync(input);
    router.push(`/produtos/${produto.id}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo produto</h1>
      <ProdutoForm
        onSubmit={handleSubmit}
        submitLabel="Criar produto"
        submittingLabel="Criando..."
        error={criarProduto.error}
        isPending={criarProduto.isPending}
      />
    </div>
  );
}
