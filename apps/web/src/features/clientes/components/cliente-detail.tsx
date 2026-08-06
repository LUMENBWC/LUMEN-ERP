'use client';

import { Switch } from '@/components/ui/switch';
import { useAtualizarCliente, useCliente, useDefinirAtivoCliente } from '../api/clientes.queries';
import type { CriarClienteInput } from '../schemas/cliente.schema';
import { ClienteForm } from './cliente-form';

export function ClienteDetail({ clienteId }: { clienteId: string }) {
  const { data: cliente, isLoading, isError } = useCliente(clienteId);
  const atualizarCliente = useAtualizarCliente(clienteId);
  const definirAtivo = useDefinirAtivoCliente(clienteId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !cliente)
    return <p className="text-destructive text-sm">Cliente não encontrado.</p>;

  async function handleSubmit(input: CriarClienteInput) {
    await atualizarCliente.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{cliente.nome}</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Ativo</span>
          <Switch
            checked={cliente.ativo}
            disabled={definirAtivo.isPending}
            onCheckedChange={(checked) => definirAtivo.mutate(checked)}
          />
        </div>
      </div>

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
          limiteCredito: Number(cliente.limiteCredito),
          observacoes: cliente.observacoes,
        }}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        error={atualizarCliente.error}
        isPending={atualizarCliente.isPending}
      />

      <p className="text-muted-foreground text-xs">
        Histórico de compras aparece aqui quando os módulos de Orçamentos e Vendas existirem.
      </p>
    </div>
  );
}
