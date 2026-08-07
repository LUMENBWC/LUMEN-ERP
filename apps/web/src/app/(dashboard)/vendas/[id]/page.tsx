import { AcessoNegado } from '@/components/acesso-negado';
import { VendaDetail } from '@/features/vendas/components/venda-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function VendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await temPermissao('vendas.criar'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <VendaDetail vendaId={id} />;
}
