import { AcessoNegado } from '@/components/acesso-negado';
import { CriarClientePage } from '@/features/clientes/components/criar-cliente-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovoClientePage() {
  if (!(await temPermissao('clientes.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <CriarClientePage />;
}
