import { AcessoNegado } from '@/components/acesso-negado';
import { CriarContaPagarPage } from '@/features/financeiro/components/criar-conta-pagar-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovaContaPagarPage() {
  if (!(await temPermissao('financeiro.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <CriarContaPagarPage />;
}
