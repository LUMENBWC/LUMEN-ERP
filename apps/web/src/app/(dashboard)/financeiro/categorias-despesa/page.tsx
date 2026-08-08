import { AcessoNegado } from '@/components/acesso-negado';
import { CategoriasDespesaPage } from '@/features/financeiro/components/categorias-despesa-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function CategoriasDespesaRoutePage() {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  return <CategoriasDespesaPage />;
}
