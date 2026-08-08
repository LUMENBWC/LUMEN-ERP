import { AcessoNegado } from '@/components/acesso-negado';
import { ContasPagarList } from '@/features/financeiro/components/contas-pagar-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ContasPagarPage() {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  return <ContasPagarList />;
}
