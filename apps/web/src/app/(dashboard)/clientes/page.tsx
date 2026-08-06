import { AcessoNegado } from '@/components/acesso-negado';
import { ClientesList } from '@/features/clientes/components/clientes-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ClientesPage() {
  if (!(await temPermissao('clientes.ler'))) {
    return <AcessoNegado />;
  }

  return <ClientesList />;
}
