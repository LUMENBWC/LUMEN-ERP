import { AcessoNegado } from '@/components/acesso-negado';
import { UsuariosList } from '@/features/usuarios/components/usuarios-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function UsuariosPage() {
  if (!(await temPermissao('usuarios.gerenciar'))) {
    return <AcessoNegado />;
  }

  return <UsuariosList />;
}
