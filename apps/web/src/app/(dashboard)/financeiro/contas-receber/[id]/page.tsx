import { AcessoNegado } from '@/components/acesso-negado';
import { ContaReceberDetail } from '@/features/financeiro/components/conta-receber-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ContaReceberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <ContaReceberDetail contaReceberId={id} />;
}
