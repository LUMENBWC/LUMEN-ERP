import { AcessoNegado } from '@/components/acesso-negado';
import { CaixaPage } from '@/features/caixa/components/caixa-page';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function CaixaRoutePage() {
  if (!(await temPermissao('caixa.abrir'))) {
    return <AcessoNegado />;
  }

  return <CaixaPage />;
}
