import { AcessoNegado } from '@/components/acesso-negado';
import { ProdutosList } from '@/features/produtos/components/produtos-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ProdutosPage() {
  if (!(await temPermissao('produtos.ler'))) {
    return <AcessoNegado />;
  }

  return <ProdutosList />;
}
