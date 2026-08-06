'use client';

import { useRouter } from 'next/navigation';
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
      <h1 className="text-xl font-semibold">Novo fornecedor</h1>
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
