'use client';

import { useRouter } from 'next/navigation';
import { useCriarCliente } from '../api/clientes.queries';
import type { CriarClienteInput } from '../schemas/cliente.schema';
import { ClienteForm } from './cliente-form';

export function CriarClientePage() {
  const router = useRouter();
  const criarCliente = useCriarCliente();

  async function handleSubmit(input: CriarClienteInput) {
    await criarCliente.mutateAsync(input);
    router.push('/clientes');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo cliente</h1>
      <ClienteForm
        onSubmit={handleSubmit}
        submitLabel="Criar cliente"
        submittingLabel="Criando..."
        error={criarCliente.error}
        isPending={criarCliente.isPending}
      />
    </div>
  );
}
