import { AcessoNegado } from '@/components/acesso-negado';
import { SessaoDetail } from '@/features/caixa/components/sessao-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function SessaoCaixaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await temPermissao('caixa.abrir'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <SessaoDetail sessaoId={id} />;
}
