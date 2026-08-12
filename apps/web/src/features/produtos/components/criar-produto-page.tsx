'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { useCriarProduto } from '../api/produtos.queries';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import { ProdutoForm } from './produto-form';

export function CriarProdutoPage() {
  const router = useRouter();
  const criarProduto = useCriarProduto();

  async function handleSubmit(input: CriarProdutoInput) {
    await criarProduto.mutateAsync(input);
    router.push('/produtos');
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Novo produto" />
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
