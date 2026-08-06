import { AcessoNegado } from '@/components/acesso-negado';
import { CriarOrcamentoPage } from '@/features/orcamentos/components/criar-orcamento-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovoOrcamentoPage() {
  if (!(await temPermissao('orcamentos.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <CriarOrcamentoPage />;
}
