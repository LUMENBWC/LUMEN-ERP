'use client';

import { Switch } from '@/components/ui/switch';
import {
  useAtualizarFornecedor,
  useDefinirAtivoFornecedor,
  useFornecedor,
} from '../api/fornecedores.queries';
import type { CriarFornecedorInput } from '../schemas/fornecedor.schema';
import { FornecedorForm } from './fornecedor-form';
import { FornecedorHistoricoCompras } from './fornecedor-historico-compras';
import { ProdutosVinculados } from './produtos-vinculados';

export function FornecedorDetail({ fornecedorId }: { fornecedorId: string }) {
  const { data: fornecedor, isLoading, isError } = useFornecedor(fornecedorId);
  const atualizarFornecedor = useAtualizarFornecedor(fornecedorId);
  const definirAtivo = useDefinirAtivoFornecedor(fornecedorId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !fornecedor)
    return <p className="text-destructive text-sm">Fornecedor não encontrado.</p>;

  async function handleSubmit(input: CriarFornecedorInput) {
    await atualizarFornecedor.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{fornecedor.nome}</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Ativo</span>
          <Switch
            checked={fornecedor.ativo}
            disabled={definirAtivo.isPending}
            onCheckedChange={(checked) => definirAtivo.mutate(checked)}
          />
        </div>
      </div>

      <FornecedorForm
        defaultValues={{
          tipoPessoa: fornecedor.tipoPessoa,
          nome: fornecedor.nome,
          documento: fornecedor.documento,
          telefone: fornecedor.telefone,
          email: fornecedor.email,
          logradouro: fornecedor.logradouro,
          numero: fornecedor.numero,
          complemento: fornecedor.complemento,
          bairro: fornecedor.bairro,
          cidade: fornecedor.cidade,
          uf: fornecedor.uf,
          cep: fornecedor.cep,
          observacoes: fornecedor.observacoes,
        }}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        error={atualizarFornecedor.error}
        isPending={atualizarFornecedor.isPending}
      />

      <ProdutosVinculados fornecedorId={fornecedorId} produtos={fornecedor.produtos} />

      <FornecedorHistoricoCompras fornecedorId={fornecedorId} />
    </div>
  );
}
