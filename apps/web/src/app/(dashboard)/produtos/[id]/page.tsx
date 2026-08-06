import { AcessoNegado } from '@/components/acesso-negado';
import { ProdutoDetail } from '@/features/produtos/components/produto-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ProdutoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await temPermissao('produtos.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <ProdutoDetail produtoId={id} />;
}
