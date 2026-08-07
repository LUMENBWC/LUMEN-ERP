import { AcessoNegado } from '@/components/acesso-negado';
import { SessoesList } from '@/features/caixa/components/sessoes-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function SessoesCaixaPage() {
  if (!(await temPermissao('caixa.abrir'))) {
    return <AcessoNegado />;
  }

  return <SessoesList />;
}
