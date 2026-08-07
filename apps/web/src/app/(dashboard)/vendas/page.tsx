import { AcessoNegado } from '@/components/acesso-negado';
import { VendasList } from '@/features/vendas/components/vendas-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function VendasPage() {
  if (!(await temPermissao('vendas.criar'))) {
    return <AcessoNegado />;
  }

  return <VendasList />;
}
