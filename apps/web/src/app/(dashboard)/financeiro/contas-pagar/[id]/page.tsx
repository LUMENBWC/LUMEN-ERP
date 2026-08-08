import { AcessoNegado } from '@/components/acesso-negado';
import { ContaPagarDetail } from '@/features/financeiro/components/conta-pagar-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ContaPagarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await temPermissao('financeiro.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <ContaPagarDetail contaPagarId={id} />;
}
