'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
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
      <PageHeader backHref="/orcamentos" title="Novo orçamento" />
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
