import { AcessoNegado } from '@/components/acesso-negado';
import { PdvPage } from '@/features/pdv/components/pdv-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function PdvRoutePage() {
  if (!(await temPermissao('vendas.criar'))) {
    return <AcessoNegado />;
  }

  return <PdvPage />;
}
