import { AcessoNegado } from '@/components/acesso-negado';
import { MovimentacoesList } from '@/features/estoque/components/movimentacoes-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function EstoquePage() {
  if (!(await temPermissao('estoque.ler'))) {
    return <AcessoNegado />;
  }

  return <MovimentacoesList />;
}
