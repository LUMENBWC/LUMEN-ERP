'use client';

import { useRouter } from 'next/navigation';
import { useCriarOrcamento } from '../api/orcamentos.queries';
import type { CriarOrcamentoInput } from '../schemas/orcamento.schema';
import { OrcamentoForm } from './orcamento-form';

export function CriarOrcamentoPage() {
  const router = useRouter();
  const criarOrcamento = useCriarOrcamento();

  async function handleSubmit(input: CriarOrcamentoInput) {
    await criarOrcamento.mutateAsync(input);
    router.push('/orcamentos');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo orçamento</h1>
      <OrcamentoForm
        onSubmit={handleSubmit}
        submitLabel="Criar orçamento"
        submittingLabel="Criando..."
        error={criarOrcamento.error}
        isPending={criarOrcamento.isPending}
      />
    </div>
  );
}
