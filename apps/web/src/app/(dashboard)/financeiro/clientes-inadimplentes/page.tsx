import { AcessoNegado } from '@/components/acesso-negado';
import { ClientesInadimplentesPage } from '@/features/financeiro/components/clientes-inadimplentes-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ClientesInadimplentesRoutePage() {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  return <ClientesInadimplentesPage />;
}
