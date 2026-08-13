'use client';

import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
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

  if (isLoading) return <LoadingState />;
  if (isError || !fornecedor) return <ErrorState message="Fornecedor não encontrado." />;

  async function handleSubmit(input: CriarFornecedorInput) {
    await atualizarFornecedor.mutateAsync(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/fornecedores"
        title={fornecedor.nome}
        action={
          <>
            <span className="text-muted-foreground text-sm">Ativo</span>
            <Switch
              checked={fornecedor.ativo}
              disabled={definirAtivo.isPending}
              onCheckedChange={(checked) => definirAtivo.mutate(checked)}
            />
          </>
        }
      />

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
