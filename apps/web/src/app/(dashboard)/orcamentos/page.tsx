import { AcessoNegado } from '@/components/acesso-negado';
import { OrcamentosList } from '@/features/orcamentos/components/orcamentos-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function OrcamentosPage() {
  if (!(await temPermissao('orcamentos.ler'))) {
    return <AcessoNegado />;
  }

  return <OrcamentosList />;
}
