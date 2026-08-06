import { AcessoNegado } from '@/components/acesso-negado';
import { FornecedoresList } from '@/features/fornecedores/components/fornecedores-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function FornecedoresPage() {
  if (!(await temPermissao('fornecedores.ler'))) {
    return <AcessoNegado />;
  }

  return <FornecedoresList />;
}
