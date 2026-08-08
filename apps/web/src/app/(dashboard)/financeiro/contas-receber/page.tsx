import { AcessoNegado } from '@/components/acesso-negado';
import { ContasReceberList } from '@/features/financeiro/components/contas-receber-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ContasReceberPage() {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  return <ContasReceberList />;
}
