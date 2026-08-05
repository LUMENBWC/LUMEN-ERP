import { AcessoNegado } from '@/components/acesso-negado';
import { UsuarioDetail } from '@/features/usuarios/components/usuario-detail';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function UsuarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await temPermissao('usuarios.gerenciar'))) {
    return <AcessoNegado />;
  }

  const { id } = await params;
  return <UsuarioDetail usuarioId={id} />;
}
