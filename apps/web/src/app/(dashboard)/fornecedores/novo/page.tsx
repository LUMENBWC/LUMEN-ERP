import { AcessoNegado } from '@/components/acesso-negado';
import { CriarFornecedorPage } from '@/features/fornecedores/components/criar-fornecedor-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovoFornecedorPage() {
  if (!(await temPermissao('fornecedores.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <CriarFornecedorPage />;
}
