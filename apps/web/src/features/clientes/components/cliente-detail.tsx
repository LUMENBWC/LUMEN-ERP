'use client';

import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
import { Switch } from '@/components/ui/switch';
import { useAtualizarCliente, useCliente, useDefinirAtivoCliente } from '../api/clientes.queries';
import type { CriarClienteInput } from '../schemas/cliente.schema';
import { ClienteForm } from './cliente-form';
import { HistoricoComprasCliente } from './historico-compras';

export function ClienteDetail({ clienteId }: { clienteId: string }) {
  const { data: cliente, isLoading, isError } = useCliente(clienteId);
  const atualizarCliente = useAtualizarCliente(clienteId);
  const definirAtivo = useDefinirAtivoCliente(clienteId);

  if (isLoading) return <LoadingState />;
  if (isError || !cliente) return <ErrorState message="Cliente não encontrado." />;

  async function handleSubmit(input: CriarClienteInput) {
    await atualizarCliente.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={cliente.nome}
        action={
          <>
            <span className="text-muted-foreground text-sm">Ativo</span>
            <Switch
              checked={cliente.ativo}
              disabled={definirAtivo.isPending}
              onCheckedChange={(checked) => definirAtivo.mutate(checked)}
            />
          </>
        }
      />

      <ClienteForm
        defaultValues={{
          tipoPessoa: cliente.tipoPessoa,
          nome: cliente.nome,
          documento: cliente.documento,
          telefone: cliente.telefone,
          whatsapp: cliente.whatsapp,
          email: cliente.email,
          logradouro: cliente.logradouro,
          numero: cliente.numero,
          complemento: cliente.complemento,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          uf: cliente.uf,
          cep: cliente.cep,
          inscricaoEstadual: cliente.inscricaoEstadual,
          limiteCredito: Number(cliente.limiteCredito),
          observacoes: cliente.observacoes,
        }}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        error={atualizarCliente.error}
        isPending={atualizarCliente.isPending}
      />

      <HistoricoComprasCliente clienteId={clienteId} />
    </div>
  );
}
