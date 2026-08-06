import { AcessoNegado } from '@/components/acesso-negado';
import { FornecedorDetail } from '@/features/fornecedores/components/fornecedor-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function FornecedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await temPermissao('fornecedores.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <FornecedorDetail fornecedorId={id} />;
}
