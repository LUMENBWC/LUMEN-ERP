import { AcessoNegado } from '@/components/acesso-negado';
import { OrcamentoDetail } from '@/features/orcamentos/components/orcamento-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await temPermissao('orcamentos.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <OrcamentoDetail orcamentoId={id} />;
}
