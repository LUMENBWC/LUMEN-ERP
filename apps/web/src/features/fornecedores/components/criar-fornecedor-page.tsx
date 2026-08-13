'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { useCriarFornecedor } from '../api/fornecedores.queries';
import type { CriarFornecedorInput } from '../schemas/fornecedor.schema';
import { FornecedorForm } from './fornecedor-form';

export function CriarFornecedorPage() {
  const router = useRouter();
  const criarFornecedor = useCriarFornecedor();

  async function handleSubmit(input: CriarFornecedorInput) {
    await criarFornecedor.mutateAsync(input);
    router.push('/fornecedores');
  }

  return (
    <div className="space-y-4">
      <PageHeader backHref="/fornecedores" title="Novo fornecedor" />
      <FornecedorForm
        onSubmit={handleSubmit}
        submitLabel="Criar fornecedor"
        submittingLabel="Criando..."
        error={criarFornecedor.error}
        isPending={criarFornecedor.isPending}
      />
    </div>
  );
}
