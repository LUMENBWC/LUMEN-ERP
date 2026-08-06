import { AcessoNegado } from '@/components/acesso-negado';
import { CriarProdutoPage } from '@/features/produtos/components/criar-produto-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovoProdutoPage() {
  if (!(await temPermissao('produtos.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <CriarProdutoPage />;
}
