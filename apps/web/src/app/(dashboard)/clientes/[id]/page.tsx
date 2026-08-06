import { AcessoNegado } from '@/components/acesso-negado';
import { ClienteDetail } from '@/features/clientes/components/cliente-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await temPermissao('clientes.ler'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <ClienteDetail clienteId={id} />;
}
